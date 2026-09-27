const { recordUsage } = require('../services/subscriptionService');

function countUploadedFiles(req) {
    let count = 0;
    if (req.file) count += 1;

    if (Array.isArray(req.files)) {
        count += req.files.length;
    } else if (req.files && typeof req.files === 'object') {
        Object.values(req.files).forEach(value => {
            if (Array.isArray(value)) count += value.length;
            else if (value) count += 1;
        });
    }

    return count;
}

function usageActivity(appKey) {
    return (req, res, next) => {
        res.on('finish', () => {
            if (!req.user || !req.user.userId) return;
            if (res.statusCode < 200 || res.statusCode >= 400) return;

            const detail = `${req.method} ${req.baseUrl}${req.path}`.slice(0, 255);
            const jobs = [recordUsage(req.user.userId, appKey, 'API_CALL', 1, detail)];

            if (req.method === 'POST') {
                jobs.push(recordUsage(req.user.userId, appKey, 'RECORD_CREATE', 1, detail));
            } else if (req.method === 'PUT' || req.method === 'PATCH') {
                jobs.push(recordUsage(req.user.userId, appKey, 'RECORD_UPDATE', 1, detail));
            } else if (req.method === 'DELETE') {
                jobs.push(recordUsage(req.user.userId, appKey, 'RECORD_DELETE', 1, detail));
            }

            const uploadCount = countUploadedFiles(req);
            if (uploadCount > 0) {
                jobs.push(recordUsage(req.user.userId, appKey, 'FILE_UPLOAD', uploadCount, detail));
            }

            Promise.allSettled(jobs).then(results => {
                results.forEach(result => {
                    if (result.status === 'rejected') {
                        console.error('Usage activity tracking error:', result.reason && result.reason.message ? result.reason.message : result.reason);
                    }
                });
            });
        });

        next();
    };
}

module.exports = usageActivity;

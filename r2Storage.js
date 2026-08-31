const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    CopyObjectCommand,
    HeadObjectCommand,
    GetObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const sharp = require('sharp');

const bucketName = process.env.R2_BUCKET_NAME;
const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

function requireConfig() {
    const missing = [];

    if (!bucketName) missing.push('R2_BUCKET_NAME');
    if (!endpoint) missing.push('R2_ENDPOINT');
    if (!accessKeyId) missing.push('R2_ACCESS_KEY_ID');
    if (!secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');

    if (missing.length) {
        throw new Error(`Missing R2 environment variable(s): ${missing.join(', ')}`);
    }
}

let client = null;

function getClient() {
    requireConfig();

    if (!client) {
        client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });
    }

    return client;
}

async function optimizeFamilyTreeImage(buffer) {
    return sharp(buffer)
        .rotate()
        .resize({
            width: 1600,
            height: 1600,
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({
            quality: 78,
            mozjpeg: true
        })
        .toBuffer();
}

async function putImage(storageKey, buffer) {
    await getClient().send(new PutObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
        Body: buffer,
        ContentType: 'image/jpeg',
        CacheControl: 'private, max-age=300'
    }));
}

async function deleteImage(storageKey) {
    if (!storageKey) return;

    await getClient().send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: storageKey
    }));
}

async function copyImage(sourceKey, destinationKey) {
    await getClient().send(new CopyObjectCommand({
        Bucket: bucketName,
        Key: destinationKey,
        CopySource: `${bucketName}/${encodeURIComponent(sourceKey)}`,
        ContentType: 'image/jpeg',
        CacheControl: 'private, max-age=300',
        MetadataDirective: 'REPLACE'
    }));
}

async function imageExists(storageKey) {
    if (!storageKey) return false;

    try {
        await getClient().send(new HeadObjectCommand({
            Bucket: bucketName,
            Key: storageKey
        }));
        return true;
    } catch (err) {
        const status = err && err.$metadata && err.$metadata.httpStatusCode;

        if (status === 404 || err.name === 'NotFound' || err.name === 'NoSuchKey') {
            return false;
        }

        throw err;
    }
}

async function getSignedImageUrl(storageKey, expiresIn = 3600) {
    if (!storageKey) return null;

    return getSignedUrl(
        getClient(),
        new GetObjectCommand({
            Bucket: bucketName,
            Key: storageKey
        }),
        { expiresIn }
    );
}

module.exports = {
    optimizeFamilyTreeImage,
    putImage,
    deleteImage,
    copyImage,
    imageExists,
    getSignedImageUrl
};

const {spawnSync}=require('child_process');
const path=require('path');
const target=path.join(__dirname,'services','stage6Environment.js');
const common={DB_NAME:'wapps_test',DB_HOST:'johnny.heliohost.org',DB_USER:'wapps_test',DB_PORT:'3306',DB_SSL:'required',DB_CONNECTION_LIMIT:'5',NODE_ENV:'production',WA_ENV:'staging',APP_PUBLIC_ORIGIN:'https://wapps-stage6-test.onrender.com',PUBLIC_BASE_URL:'https://wapps-stage6-test.onrender.com',WA_ALLOWED_ORIGINS:'https://wapps-stage6-test.onrender.com'};
function check(label,extra,expectOK){const env={...process.env,...common,...extra};const r=spawnSync(process.execPath,['-e',`require(${JSON.stringify(target)})`],{env,encoding:'utf8'});const pass=(r.status===0)===expectOK; console.log(`${pass?'PASS':'FAIL'} ${label}: ${r.status===0?'accepted':(r.stderr.match(/GROUP0D_\w+/)||['rejected'])[0]}`); if(!pass)process.exitCode=1;}
check('Staging Helio exact',{},true);
check('Staging production db',{DB_NAME:'wapps'},false);
check('Staging wrong Helio user',{DB_USER:'production'},false);
check('Staging no TLS',{DB_SSL:'off'},false);
check('Staging pool 50',{DB_CONNECTION_LIMIT:'50'},false);
check('Staging localhost origin',{APP_PUBLIC_ORIGIN:'http://localhost:8080'},false);
check('Staging production origin',{APP_PUBLIC_ORIGIN:'https://wonderfulappscompany.com',PUBLIC_BASE_URL:'https://wonderfulappscompany.com',WA_ALLOWED_ORIGINS:'https://wonderfulappscompany.com'},false);
check('Staging bad public URL',{PUBLIC_BASE_URL:'http://localhost:8080'},false);
check('Staging local mode',{WA_ENV:'local'},false);
check('Local Helio',{WA_ENV:'local',NODE_ENV:'development',APP_PUBLIC_ORIGIN:'http://localhost:8080',WA_ALLOWED_ORIGINS:'http://localhost:8080',PUBLIC_BASE_URL:'http://localhost:8080'},true);

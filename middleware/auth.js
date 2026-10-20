// Centralized authorization; preserve historical req.user.userId contract.
'use strict';
const {pool}=require('../dbConnection');
const {verifyAccessToken,AuthenticationError}=require('../services/verifyAccessToken');
async function auth(req,res,next){
 const match=/^Bearer (\S+)$/i.exec(req.get('Authorization')||'');
 if(!match)return res.status(401).json({error:'Access denied. No token provided.'});
 try{req.user=await verifyAccessToken(match[1],{database:pool,jwtSecret:process.env.JWT_SECRET});next();}
 catch(e){if(e instanceof AuthenticationError)return res.status(e.status).json({error:e.code});next(e);}
}
module.exports=auth;

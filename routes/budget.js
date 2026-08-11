// File: routes/budget.js
// Wonderful Apps - Budget API
// Mount in server.js with: app.use('/budget', require('./routes/budget'));

const express = require('express');
const { param, validationResult } = require('express-validator');
const router = express.Router();

const { pool, getNextUserSpecificID } = require('../dbConnection');
const auth = require('../middleware/auth');
const { handleDbError, withTransaction } = require('../utils');

const FREQUENCIES = ['OneTime', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
const DAILY_PATTERNS = ['Interval', 'Weekday', 'WeekendDay'];
const MONTHLY_PATTERNS = ['NumberedDays', 'OrdinalWeekday'];
const YEARLY_PATTERNS = ['SpecificDate', 'OrdinalWeekday'];
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Last'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const RANGES = ['NoEnd', 'EndDate', 'OccurrenceCount'];
const DAY_INDEX = Object.freeze({ Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 });

const SOURCES = {
  in: {
    path:'in', table:'BudgetInT', pk:'InID', userKey:'UserInID', start:'DateBegin', end:'DateEnd',
    order:'DateBegin DESC, UserInID DESC',
    fields:[
      ['FromName','text',1],['Description','text',1],['DateBegin','date',1],['DateEnd','date',0],
      ['Amount','money',1],['Active','bool',1],['Estimated','bool',1],['Note','text',0]
    ]
  },
  out: {
    path:'out', table:'BudgetOutT', pk:'OutID', userKey:'UserOutID', start:'DateBegin', end:'DateEnd',
    order:'DateBegin DESC, UserOutID DESC',
    fields:[
      ['ToName','text',1],['Description','text',1],['DateBegin','date',1],['DateEnd','date',0],
      ['Amount','money',1],['Active','bool',1],['Estimated','bool',1],['Note','text',0]
    ]
  },
  subscription: {
    path:'subscriptions', table:'BudgetSubscriptionT', pk:'SubscriptionID', userKey:'UserSubscriptionID',
    start:'DateBegin', end:'DateEnd', order:'ToName ASC, Description ASC',
    fields:[
      ['ToName','text',1],['Description','text',1],['Amount','money',1],['DateBegin','date',1],
      ['DateEnd','date',0],['PaymentAccount','text',0],['AutoRenew','bool',1],['Active','bool',1],
      ['Estimated','bool',1],['Note','text',0]
    ]
  },
  loan: {
    path:'loans', table:'BudgetLoanT', pk:'LoanID', userKey:'UserLoanID',
    start:'PaymentDateBegin', end:'PaymentDateEnd', noNoEnd:true, oneTimeEnd:true,
    order:'DateLoan DESC, UserLoanID DESC',
    fields:[
      ['FromName','text',1],['DateLoan','date',1],['Description','text',1],['LoanAmount','money',1],
      ['LoanAmountIsEstimated','bool',1],['PaymentDateBegin','date',1],['PaymentDateEnd','date',1],
      ['PaymentAmount','money',1],['PaymentAmountIsEstimated','bool',1],['Active','bool',1],['Note','text',0]
    ]
  },
  leaseRent: {
    path:'lease-rent', table:'BudgetLeaseRentT', pk:'LeaseRentID', userKey:'UserLeaseRentID',
    start:'PaymentDateBegin', end:'PaymentDateEnd', order:'ToName ASC, Description ASC',
    fields:[
      ['ToName','text',1],['AgreementDate','date',1],['Description','text',1],
      ['PaymentDateBegin','date',1],['PaymentDateEnd','date',0],['PaymentAmount','money',1],
      ['PaymentAmountIsEstimated','bool',1],['Active','bool',1],['Note','text',0]
    ]
  },
  estimate: {
    path:'estimates', table:'BudgetEstimateAllowanceT', pk:'EstimateID', userKey:'UserEstimateID',
    start:'DateBegin', end:'DateEnd', order:'InOrOut ASC, Description ASC',
    fields:[
      ['InOrOut','direction',1],['FromNameOrToName','text',0],['Description','text',1],
      ['DateBegin','date',1],['DateEnd','date',0],['Amount','money',1],['Active','bool',1],['Note','text',0]
    ]
  }
};

function bad(res, msg) { return res.status(400).json({ error: `${msg}(be)` }); }
function isoDate(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === v;
}
function toDate(v) { return new Date(`${v}T00:00:00.000Z`); }
function toIso(d) { return d.toISOString().slice(0,10); }
function addDays(d,n){ const x=new Date(d); x.setUTCDate(x.getUTCDate()+n); return x; }
function addMonths(d,n){ const x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1)); x.setUTCMonth(x.getUTCMonth()+n); return x; }
function addYears(d,n){ return new Date(Date.UTC(d.getUTCFullYear()+n,d.getUTCMonth(),1)); }
function monthNo(d){ return d.getUTCFullYear()*12+d.getUTCMonth(); }
function daysBetween(a,b){ return Math.floor((b-a)/86400000); }
function lastDay(y,m){ return new Date(Date.UTC(y,m+1,0)).getUTCDate(); }
function safeDate(y,m,day){ return new Date(Date.UTC(y,m,Math.min(day,lastDay(y,m)))); }
function bool(v, def=false){
  if(v===undefined||v===null||v==='') return def?1:0;
  return (v===true||v===1||v==='1'||v==='true'||v==='on')?1:0;
}
function text(v){ if(v===undefined||v===null) return null; const s=String(v).trim(); return s||null; }
function money(v){ if(v===undefined||v===null||v==='') return null; const n=Number(v); return Number.isFinite(n)?Number(n.toFixed(2)):null; }

function ordinalDate(y,m,ordinal,weekday){
  const target=DAY_INDEX[weekday];
  if(target===undefined) return null;
  if(ordinal==='Last'){
    let d=new Date(Date.UTC(y,m+1,0));
    while(d.getUTCDay()!==target) d=addDays(d,-1);
    return d;
  }
  const n={First:1,Second:2,Third:3,Fourth:4}[ordinal];
  if(!n) return null;
  let d=new Date(Date.UTC(y,m,1));
  while(d.getUTCDay()!==target) d=addDays(d,1);
  d=addDays(d,(n-1)*7);
  return d.getUTCMonth()===m?d:null;
}

function normalizeRecurrence(raw={}){
  const weekly=Array.isArray(raw.WeeklyDays)?[...new Set(raw.WeeklyDays.map(String))]:[];
  const monthly=(Array.isArray(raw.MonthlyDays)?raw.MonthlyDays:[]).map(v=>{
    if(typeof v==='number'||typeof v==='string'){
      if(String(v).toLowerCase()==='last') return {DayOfMonth:null,IsLastDay:1};
      return {DayOfMonth:Number(v),IsLastDay:0};
    }
    return {
      DayOfMonth:v&&v.DayOfMonth!==undefined&&v.DayOfMonth!==null?Number(v.DayOfMonth):null,
      IsLastDay:bool(v&&v.IsLastDay)
    };
  });
  return {
    FrequencyType:text(raw.FrequencyType),
    IntervalNumber:raw.IntervalNumber===undefined||raw.IntervalNumber===null||raw.IntervalNumber===''?1:Number(raw.IntervalNumber),
    DailyPattern:text(raw.DailyPattern),
    MonthlyPattern:text(raw.MonthlyPattern),
    OrdinalPosition:text(raw.OrdinalPosition),
    OrdinalWeekday:text(raw.OrdinalWeekday),
    YearlyPattern:text(raw.YearlyPattern),
    YearMonth:raw.YearMonth===undefined||raw.YearMonth===null||raw.YearMonth===''?null:Number(raw.YearMonth),
    YearDay:raw.YearDay===undefined||raw.YearDay===null||raw.YearDay===''?null:Number(raw.YearDay),
    RangeType:text(raw.RangeType),
    OccurrenceCount:raw.OccurrenceCount===undefined||raw.OccurrenceCount===null||raw.OccurrenceCount===''?null:Number(raw.OccurrenceCount),
    WeeklyDays:weekly, MonthlyDays:monthly
  };
}

function validateRecurrence(r,{noNoEnd=false}={}){
  if(!FREQUENCIES.includes(r.FrequencyType)) return 'Frequency Type is invalid';
  if(!Number.isInteger(r.IntervalNumber)||r.IntervalNumber<1) return 'Interval Number must be a positive whole number';
  if(r.FrequencyType==='OneTime') return null;
  if(!RANGES.includes(r.RangeType)) return 'Range Type is required';
  if(noNoEnd&&r.RangeType==='NoEnd') return 'Loan payment recurrence cannot use No End Date';
  if(r.RangeType==='OccurrenceCount'&&(!Number.isInteger(r.OccurrenceCount)||r.OccurrenceCount<1))
    return 'Occurrence Count must be at least 1';

  if(r.FrequencyType==='Daily'){
    if(!DAILY_PATTERNS.includes(r.DailyPattern)) return 'Daily Pattern is invalid';
    if(r.DailyPattern!=='Interval') r.IntervalNumber=1;
  }
  if(r.FrequencyType==='Weekly'){
    if(!r.WeeklyDays.length) return 'Weekly recurrence requires at least one weekday';
    if(r.WeeklyDays.some(d=>!WEEKDAYS.includes(d))) return 'Weekly recurrence contains an invalid weekday';
  }
  if(r.FrequencyType==='Monthly'){
    if(!MONTHLY_PATTERNS.includes(r.MonthlyPattern)) return 'Monthly Pattern is invalid';
    if(r.MonthlyPattern==='NumberedDays'){
      if(!r.MonthlyDays.length) return 'Monthly recurrence requires at least one numbered day or Last Day';
      const nums=new Set(); let lastCount=0;
      for(const v of r.MonthlyDays){
        if(v.IsLastDay){ lastCount++; continue; }
        if(!Number.isInteger(v.DayOfMonth)||v.DayOfMonth<1||v.DayOfMonth>31) return 'Monthly day must be between 1 and 31';
        if(nums.has(v.DayOfMonth)) return 'The same monthly day cannot be selected twice';
        nums.add(v.DayOfMonth);
      }
      if(lastCount>1) return 'Last Day can be selected only once';
    } else {
      if(!ORDINALS.includes(r.OrdinalPosition)) return 'Monthly ordinal is invalid';
      if(!WEEKDAYS.includes(r.OrdinalWeekday)) return 'Monthly weekday is invalid';
    }
  }
  if(r.FrequencyType==='Yearly'){
    if(!YEARLY_PATTERNS.includes(r.YearlyPattern)) return 'Yearly Pattern is invalid';
    if(!Number.isInteger(r.YearMonth)||r.YearMonth<1||r.YearMonth>12) return 'Year Month must be between 1 and 12';
    if(r.YearlyPattern==='SpecificDate'){
      if(!Number.isInteger(r.YearDay)||r.YearDay<1||r.YearDay>31) return 'Year Day must be between 1 and 31';
    } else {
      if(!ORDINALS.includes(r.OrdinalPosition)) return 'Yearly ordinal is invalid';
      if(!WEEKDAYS.includes(r.OrdinalWeekday)) return 'Yearly weekday is invalid';
    }
  }
  return null;
}

function searchEnd(start,r,windowEnd){
  if(r.RangeType!=='OccurrenceCount') return windowEnd;
  const n=r.OccurrenceCount||1, i=r.IntervalNumber||1;
  if(r.FrequencyType==='Daily') return addDays(start,Math.max(14,n*i*7));
  if(r.FrequencyType==='Weekly') return addDays(start,Math.max(28,n*i*14));
  if(r.FrequencyType==='Monthly') return addMonths(start,Math.max(2,n*i+2));
  if(r.FrequencyType==='Yearly') return addYears(start,Math.max(2,n*i+2));
  return windowEnd;
}

function occurrences(startIso,endIso,raw,windowStartIso,windowEndIso){
  const r=normalizeRecurrence(raw);
  const start=toDate(startIso), wStart=toDate(windowStartIso), requestedEnd=toDate(windowEndIso);

  if(r.FrequencyType==='OneTime') return start>=wStart&&start<=requestedEnd?[startIso]:[];

  let hardEnd=requestedEnd;
  if(endIso&&toDate(endIso)<hardEnd) hardEnd=toDate(endIso);
  const end=searchEnd(start,r,hardEnd);
  const set=new Set();
  const add=d=>{ if(d&&d>=start&&d<=end) set.add(toIso(d)); };

  if(r.FrequencyType==='Daily'){
    if(r.DailyPattern==='Interval'){
      for(let d=new Date(start);d<=end;d=addDays(d,r.IntervalNumber)) add(d);
    }else{
      for(let d=new Date(start);d<=end;d=addDays(d,1)){
        const wd=d.getUTCDay();
        if(r.DailyPattern==='Weekday'&&wd>=1&&wd<=5) add(d);
        if(r.DailyPattern==='WeekendDay'&&(wd===0||wd===6)) add(d);
      }
    }
  }

  if(r.FrequencyType==='Weekly'){
    const selected=new Set(r.WeeklyDays.map(d=>DAY_INDEX[d]));
    const startWeek=addDays(start,-start.getUTCDay());
    for(let d=new Date(start);d<=end;d=addDays(d,1)){
      if(!selected.has(d.getUTCDay())) continue;
      const currentWeek=addDays(d,-d.getUTCDay());
      const weeks=Math.floor(daysBetween(startWeek,currentWeek)/7);
      if(weeks>=0&&weeks%r.IntervalNumber===0) add(d);
    }
  }

  if(r.FrequencyType==='Monthly'){
    for(let mi=monthNo(start);mi<=monthNo(end);mi+=r.IntervalNumber){
      const y=Math.floor(mi/12), m=mi%12;
      if(r.MonthlyPattern==='NumberedDays'){
        for(const v of r.MonthlyDays){
          add(v.IsLastDay?safeDate(y,m,lastDay(y,m)):safeDate(y,m,v.DayOfMonth));
        }
      }else add(ordinalDate(y,m,r.OrdinalPosition,r.OrdinalWeekday));
    }
  }

  if(r.FrequencyType==='Yearly'){
    for(let y=start.getUTCFullYear();y<=end.getUTCFullYear();y+=r.IntervalNumber){
      const m=r.YearMonth-1;
      add(r.YearlyPattern==='SpecificDate'
        ?safeDate(y,m,r.YearDay)
        :ordinalDate(y,m,r.OrdinalPosition,r.OrdinalWeekday));
    }
  }

  let all=[...set].sort();
  if(r.RangeType==='OccurrenceCount') all=all.slice(0,r.OccurrenceCount);
  return all.filter(x=>{
    const d=toDate(x);
    return d>=wStart&&d<=requestedEnd&&(!endIso||d<=toDate(endIso));
  });
}

function finalOccurrence(startIso,r){
  const rec=normalizeRecurrence(r);
  const far=searchEnd(toDate(startIso),rec,addYears(toDate(startIso),200));
  const dates=occurrences(startIso,null,rec,startIso,toIso(far));
  if(dates.length<rec.OccurrenceCount) throw new Error('Unable to calculate the requested number of occurrences(be)');
  return dates[rec.OccurrenceCount-1];
}

async function loadRecurrence(db,id,userId){
  const [rows]=await db.query('SELECT * FROM BudgetRecurrenceT WHERE RecurrenceID=? AND UserID=?',[id,userId]);
  if(!rows.length) return null;
  const r=rows[0];
  const [w]=await db.query('SELECT DayOfWeek FROM BudgetRecurrenceWeeklyDayT WHERE RecurrenceID=?',[id]);
  const [m]=await db.query('SELECT DayOfMonth,IsLastDay FROM BudgetRecurrenceMonthlyDayT WHERE RecurrenceID=?',[id]);
  r.WeeklyDays=w.map(x=>x.DayOfWeek);
  r.MonthlyDays=m.map(x=>({DayOfMonth:x.DayOfMonth,IsLastDay:Number(x.IsLastDay)}));
  return r;
}

async function writeRecurrenceChildren(db,id,r){
  await db.query('DELETE FROM BudgetRecurrenceWeeklyDayT WHERE RecurrenceID=?',[id]);
  await db.query('DELETE FROM BudgetRecurrenceMonthlyDayT WHERE RecurrenceID=?',[id]);
  if(r.FrequencyType==='Weekly'){
    for(const d of r.WeeklyDays) await db.query(
      'INSERT INTO BudgetRecurrenceWeeklyDayT (RecurrenceID,DayOfWeek) VALUES (?,?)',[id,d]);
  }
  if(r.FrequencyType==='Monthly'&&r.MonthlyPattern==='NumberedDays'){
    for(const v of r.MonthlyDays) await db.query(
      'INSERT INTO BudgetRecurrenceMonthlyDayT (RecurrenceID,DayOfMonth,IsLastDay) VALUES (?,?,?)',
      [id,v.IsLastDay?null:v.DayOfMonth,v.IsLastDay?1:0]);
  }
}

async function insertRecurrence(db,userId,raw,opts={}){
  const r=normalizeRecurrence(raw);
  const err=validateRecurrence(r,opts); if(err) throw new Error(`${err}(be)`);
  const userRecurrenceId=await getNextUserSpecificID(userId,'BudgetRecurrenceT','UserRecurrenceID');
  const [result]=await db.query(
    `INSERT INTO BudgetRecurrenceT
     (UserID,UserRecurrenceID,FrequencyType,IntervalNumber,DailyPattern,MonthlyPattern,
      OrdinalPosition,OrdinalWeekday,YearlyPattern,YearMonth,YearDay,RangeType,OccurrenceCount)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [userId,userRecurrenceId,r.FrequencyType,r.IntervalNumber,r.DailyPattern,r.MonthlyPattern,
     r.OrdinalPosition,r.OrdinalWeekday,r.YearlyPattern,r.YearMonth,r.YearDay,
     r.FrequencyType==='OneTime'?null:r.RangeType,r.FrequencyType==='OneTime'?null:r.OccurrenceCount]
  );
  await writeRecurrenceChildren(db,result.insertId,r);
  return result.insertId;
}

async function updateRecurrence(db,id,userId,raw,opts={}){
  const r=normalizeRecurrence(raw);
  const err=validateRecurrence(r,opts); if(err) throw new Error(`${err}(be)`);
  const [owner]=await db.query('SELECT RecurrenceID FROM BudgetRecurrenceT WHERE RecurrenceID=? AND UserID=?',[id,userId]);
  if(!owner.length) throw new Error('Recurrence record not found(be)');
  await db.query(
    `UPDATE BudgetRecurrenceT SET FrequencyType=?,IntervalNumber=?,DailyPattern=?,MonthlyPattern=?,
     OrdinalPosition=?,OrdinalWeekday=?,YearlyPattern=?,YearMonth=?,YearDay=?,RangeType=?,OccurrenceCount=?
     WHERE RecurrenceID=? AND UserID=?`,
    [r.FrequencyType,r.IntervalNumber,r.DailyPattern,r.MonthlyPattern,r.OrdinalPosition,r.OrdinalWeekday,
     r.YearlyPattern,r.YearMonth,r.YearDay,r.FrequencyType==='OneTime'?null:r.RangeType,
     r.FrequencyType==='OneTime'?null:r.OccurrenceCount,id,userId]
  );
  await writeRecurrenceChildren(db,id,r);
}

function normalizeSource(raw,cfg){
  const b={...raw};
  for(const [f,t,required] of cfg.fields){
    const v=b[f];
    if(required&&(v===undefined||v===null||v==='')) return {error:`${f} is required`};
    if(!required&&(v===undefined||v==='')){ b[f]=null; continue; }
    if(t==='text'){
      b[f]=text(v);
      if(required&&!b[f]) return {error:`${f} is required`};
      if(b[f]&&b[f].length>2000) return {error:`${f} is too long`};
    }
    if(t==='date'){
      if(v===null&&!required) b[f]=null;
      else if(!isoDate(v)) return {error:`${f} must be a valid YYYY-MM-DD date`};
    }
    if(t==='money'){
      b[f]=money(v);
      if(b[f]===null||b[f]<0) return {error:`${f} must be zero or greater`};
    }
    if(t==='bool') b[f]=bool(v,f==='Active');
    if(t==='direction'&&!['In','Out'].includes(v)) return {error:`${f} must be In or Out`};
  }
  const r=normalizeRecurrence(b.Recurrence||b.recurrence);
  const err=validateRecurrence(r,{noNoEnd:!!cfg.noNoEnd}); if(err) return {error:err};
  if(r.FrequencyType==='OneTime') b[cfg.end]=cfg.oneTimeEnd?b[cfg.start]:null;
  else if(r.RangeType==='NoEnd') b[cfg.end]=null;
  else if(r.RangeType==='EndDate'){
    if(!isoDate(b[cfg.end])) return {error:`${cfg.end} is required when recurrence ends on a date`};
  }else if(r.RangeType==='OccurrenceCount'){
    try{ b[cfg.end]=finalOccurrence(b[cfg.start],r); }catch(e){ return {error:e.message.replace(/\(be\)$/,'')}; }
  }
  if(b[cfg.end]&&toDate(b[cfg.end])<toDate(b[cfg.start])) return {error:`${cfg.end} may not precede ${cfg.start}`};
  return {body:b,recurrence:r};
}

function statusSql(status){
  status=(status||'active').toLowerCase();
  if(status==='all') return '';
  if(status==='inactive') return ' AND Active=0';
  return ' AND Active=1';
}

function validExpress(req,res){
  const e=validationResult(req);
  if(e.isEmpty()) return true;
  res.status(400).json({error:`${e.array()[0].msg}(be)`,details:e.array()}); return false;
}

function registerSource(cfg){
  const base=`/${cfg.path}`;

  router.get(base,auth,async(req,res)=>{
    try{
      const [rows]=await pool.query(
        `SELECT * FROM ${cfg.table} WHERE UserID=?${statusSql(req.query.status)} ORDER BY ${cfg.order}`,
        [req.user.userId]);
      res.json(rows);
    }catch(e){ handleDbError(e,res,`Error fetching ${cfg.path}`); }
  });

  router.get(`${base}/:${cfg.userKey}`,auth,
    param(cfg.userKey).isInt({min:1}).withMessage(`${cfg.userKey} must be a positive integer`),
    async(req,res)=>{
      if(!validExpress(req,res)) return;
      try{
        const [rows]=await pool.query(
          `SELECT * FROM ${cfg.table} WHERE ${cfg.userKey}=? AND UserID=?`,
          [Number(req.params[cfg.userKey]),req.user.userId]);
        if(!rows.length) return res.status(404).json({error:'Budget record not found(be)'});
        rows[0].Recurrence=await loadRecurrence(pool,rows[0].RecurrenceID,req.user.userId);
        res.json(rows[0]);
      }catch(e){ handleDbError(e,res,`Error fetching ${cfg.path} record`); }
    });

  router.post(base,auth,async(req,res)=>{
    const n=normalizeSource(req.body,cfg); if(n.error) return bad(res,n.error);
    const userId=req.user.userId;
    try{
      const userSpecificId=await getNextUserSpecificID(userId,cfg.table,cfg.userKey);
      const result=await withTransaction(async db=>{
        const recurrenceId=await insertRecurrence(db,userId,n.recurrence,{noNoEnd:!!cfg.noNoEnd});
        const names=cfg.fields.map(x=>x[0]), values=names.map(f=>n.body[f]);
        const cols=['UserID',cfg.userKey,...names,'RecurrenceID'];
        const vals=[userId,userSpecificId,...values,recurrenceId];
        const [ins]=await db.query(
          `INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${vals.map(()=>'?').join(',')})`,vals);
        return {id:ins.insertId,userSpecificId,recurrenceId,endDate:n.body[cfg.end]};
      });
      res.status(201).json({message:'Budget record created(be)',data:result});
    }catch(e){
      if(e.message&&e.message.endsWith('(be)')) return res.status(400).json({error:e.message});
      handleDbError(e,res,`Error creating ${cfg.path} record`);
    }
  });

  router.put(`${base}/:${cfg.userKey}`,auth,
    param(cfg.userKey).isInt({min:1}).withMessage(`${cfg.userKey} must be a positive integer`),
    async(req,res)=>{
      if(!validExpress(req,res)) return;
      const n=normalizeSource(req.body,cfg); if(n.error) return bad(res,n.error);
      const userId=req.user.userId, userSpecificId=Number(req.params[cfg.userKey]);
      try{
        const data=await withTransaction(async db=>{
          const [rows]=await db.query(
            `SELECT RecurrenceID FROM ${cfg.table} WHERE ${cfg.userKey}=? AND UserID=? FOR UPDATE`,
            [userSpecificId,userId]);
          if(!rows.length){ const x=new Error('Budget record not found(be)'); x.status=404; throw x; }
          const recurrenceId=rows[0].RecurrenceID;
          await updateRecurrence(db,recurrenceId,userId,n.recurrence,{noNoEnd:!!cfg.noNoEnd});
          const names=cfg.fields.map(x=>x[0]), values=names.map(f=>n.body[f]);
          await db.query(
            `UPDATE ${cfg.table} SET ${names.map(f=>`${f}=?`).join(',')},RecurrenceID=?
             WHERE ${cfg.userKey}=? AND UserID=?`,
            [...values,recurrenceId,userSpecificId,userId]);
          return {userSpecificId,recurrenceId,endDate:n.body[cfg.end]};
        });
        res.json({message:'Budget record updated(be)',data});
      }catch(e){
        if(e.status===404) return res.status(404).json({error:e.message});
        if(e.message&&e.message.endsWith('(be)')) return res.status(400).json({error:e.message});
        handleDbError(e,res,`Error updating ${cfg.path} record`);
      }
    });

  router.delete(`${base}/:${cfg.userKey}`,auth,
    param(cfg.userKey).isInt({min:1}).withMessage(`${cfg.userKey} must be a positive integer`),
    async(req,res)=>{
      if(!validExpress(req,res)) return;
      const userId=req.user.userId, id=Number(req.params[cfg.userKey]);
      try{
        await withTransaction(async db=>{
          const [rows]=await db.query(
            `SELECT RecurrenceID FROM ${cfg.table} WHERE ${cfg.userKey}=? AND UserID=? FOR UPDATE`,[id,userId]);
          if(!rows.length){ const x=new Error('Budget record not found(be)'); x.status=404; throw x; }
          await db.query(`DELETE FROM ${cfg.table} WHERE ${cfg.userKey}=? AND UserID=?`,[id,userId]);
          await db.query('DELETE FROM BudgetRecurrenceT WHERE RecurrenceID=? AND UserID=?',[rows[0].RecurrenceID,userId]);
        });
        res.json({message:'Budget record deleted(be)'});
      }catch(e){
        if(e.status===404) return res.status(404).json({error:e.message});
        handleDbError(e,res,`Error deleting ${cfg.path} record`);
      }
    });
}
Object.values(SOURCES).forEach(registerSource);

// Descriptions
router.get('/descriptions',auth,async(req,res)=>{
  const type=req.query.inOrOut;
  if(type&&!['In','Out'].includes(type)) return bad(res,'inOrOut must be In or Out');
  try{
    const p=[req.user.userId]; let extra='';
    if(type){ extra=' AND InOrOut=?'; p.push(type); }
    const [rows]=await pool.query(
      `SELECT * FROM BudgetDescriptionT
       WHERE Active=1 AND (UserID IS NULL OR UserID=?)${extra}
       ORDER BY InOrOut,Description`,p);
    res.json(rows);
  }catch(e){ handleDbError(e,res,'Error fetching Budget descriptions'); }
});

router.post('/descriptions',auth,async(req,res)=>{
  const userId=req.user.userId, type=req.body.InOrOut, description=text(req.body.Description);
  if(!['In','Out'].includes(type)) return bad(res,'InOrOut must be In or Out');
  if(!description) return bad(res,'Description is required');
  if(description.length>100) return bad(res,'Description must be 100 characters or less');
  try{
    const [dupe]=await pool.query(
      `SELECT DescriptionID FROM BudgetDescriptionT
       WHERE InOrOut=? AND LOWER(Description)=LOWER(?) AND (UserID IS NULL OR UserID=?)`,
      [type,description,userId]);
    if(dupe.length) return bad(res,'That description already exists');
    const userDescriptionId=await getNextUserSpecificID(userId,'BudgetDescriptionT','UserDescriptionID');
    const [r]=await pool.query(
      `INSERT INTO BudgetDescriptionT
       (UserID,UserDescriptionID,InOrOut,Description,IsSystemDescription,Active)
       VALUES (?,?,?,?,0,1)`,[userId,userDescriptionId,type,description]);
    res.status(201).json({message:'Budget description created(be)',data:{DescriptionID:r.insertId,UserDescriptionID:userDescriptionId}});
  }catch(e){ handleDbError(e,res,'Error creating Budget description'); }
});

router.put('/descriptions/:UserDescriptionID',auth,
  param('UserDescriptionID').isInt({min:1}).withMessage('UserDescriptionID must be a positive integer'),
  async(req,res)=>{
    if(!validExpress(req,res)) return;
    const userId=req.user.userId,id=Number(req.params.UserDescriptionID);
    const type=req.body.InOrOut,description=text(req.body.Description),active=bool(req.body.Active,true);
    if(!['In','Out'].includes(type)) return bad(res,'InOrOut must be In or Out');
    if(!description) return bad(res,'Description is required');
    try{
      const [old]=await pool.query(
        'SELECT DescriptionID FROM BudgetDescriptionT WHERE UserDescriptionID=? AND UserID=? AND IsSystemDescription=0',
        [id,userId]);
      if(!old.length) return res.status(404).json({error:'Budget description not found(be)'});
      const [dupe]=await pool.query(
        `SELECT DescriptionID FROM BudgetDescriptionT
         WHERE InOrOut=? AND LOWER(Description)=LOWER(?) AND (UserID IS NULL OR UserID=?) AND DescriptionID<>?`,
        [type,description,userId,old[0].DescriptionID]);
      if(dupe.length) return bad(res,'That description already exists');
      await pool.query(
        `UPDATE BudgetDescriptionT SET InOrOut=?,Description=?,Active=?
         WHERE UserDescriptionID=? AND UserID=? AND IsSystemDescription=0`,
        [type,description,active,id,userId]);
      res.json({message:'Budget description updated(be)'});
    }catch(e){ handleDbError(e,res,'Error updating Budget description'); }
  });

router.delete('/descriptions/:UserDescriptionID',auth,
  param('UserDescriptionID').isInt({min:1}).withMessage('UserDescriptionID must be a positive integer'),
  async(req,res)=>{
    if(!validExpress(req,res)) return;
    try{
      const [r]=await pool.query(
        'DELETE FROM BudgetDescriptionT WHERE UserDescriptionID=? AND UserID=? AND IsSystemDescription=0',
        [Number(req.params.UserDescriptionID),req.user.userId]);
      if(!r.affectedRows) return res.status(404).json({error:'Budget description not found(be)'});
      res.json({message:'Budget description deleted(be)'});
    }catch(e){ handleDbError(e,res,'Error deleting Budget description'); }
  });

// Credit Cards
function normalizeCard(raw){
  const b={...raw};
  b.AccountName=text(b.AccountName); b.Last4Digits=text(b.Last4Digits);
  b.StatementBalance=money(b.StatementBalance); b.MinimumPaymentDue=money(b.MinimumPaymentDue);
  b.MinimumPaymentAlternativeAmount=money(b.MinimumPaymentAlternativeAmount);
  b.CreditLineTotal=money(b.CreditLineTotal); b.CreditLineAvailable=money(b.CreditLineAvailable);
  b.MinimumPaymentDueChecked=bool(b.MinimumPaymentDueChecked); b.Active=bool(b.Active,true); b.Note=text(b.Note);
  if(!b.AccountName) return {error:'Account Name is required'};
  if(!/^\d{4}$/.test(b.Last4Digits||'')) return {error:'Last 4 Digits must contain exactly four digits'};
  if(!isoDate(b.LastStatementDate)) return {error:'Last Statement Date must be a valid YYYY-MM-DD date'};
  if(!isoDate(b.PaymentDueDate)) return {error:'Payment Due Date must be a valid YYYY-MM-DD date'};
  if(b.StatementBalance===null||b.StatementBalance<0) return {error:'Statement Balance must be zero or greater'};
  if(b.MinimumPaymentDue===null||b.MinimumPaymentDue<0) return {error:'Minimum Payment Due must be zero or greater'};
  if(b.MinimumPaymentAlternativeAmount!==null&&b.MinimumPaymentAlternativeAmount<=b.MinimumPaymentDue)
    return {error:'Minimum Payment Alternative Amount must be blank or greater than Minimum Payment Due'};
  if(b.CreditLineTotal!==null&&b.CreditLineTotal<0) return {error:'Credit Line Total must be zero or greater'};
  if(b.CreditLineAvailable!==null&&b.CreditLineAvailable<0) return {error:'Credit Line Available must be zero or greater'};
  return {body:b};
}

router.get('/cards',auth,async(req,res)=>{
  try{
    const [rows]=await pool.query(
      `SELECT * FROM BudgetCardT WHERE UserID=?${statusSql(req.query.status)} ORDER BY AccountName,UserCardID`,
      [req.user.userId]); res.json(rows);
  }catch(e){ handleDbError(e,res,'Error fetching credit cards'); }
});

router.get('/cards/:UserCardID',auth,
  param('UserCardID').isInt({min:1}).withMessage('UserCardID must be a positive integer'),
  async(req,res)=>{
    if(!validExpress(req,res)) return;
    try{
      const [rows]=await pool.query('SELECT * FROM BudgetCardT WHERE UserCardID=? AND UserID=?',
        [Number(req.params.UserCardID),req.user.userId]);
      if(!rows.length) return res.status(404).json({error:'Credit Card record not found(be)'});
      res.json(rows[0]);
    }catch(e){ handleDbError(e,res,'Error fetching credit card'); }
  });

router.post('/cards',auth,async(req,res)=>{
  const n=normalizeCard(req.body); if(n.error) return bad(res,n.error);
  const b=n.body,userId=req.user.userId;
  try{
    const userCardId=await getNextUserSpecificID(userId,'BudgetCardT','UserCardID');
    const [r]=await pool.query(
      `INSERT INTO BudgetCardT
       (UserID,UserCardID,AccountName,Last4Digits,LastStatementDate,StatementBalance,PaymentDueDate,
        MinimumPaymentDue,MinimumPaymentDueChecked,MinimumPaymentAlternativeAmount,
        CreditLineTotal,CreditLineAvailable,Active,Note)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [userId,userCardId,b.AccountName,b.Last4Digits,b.LastStatementDate,b.StatementBalance,b.PaymentDueDate,
       b.MinimumPaymentDue,b.MinimumPaymentDueChecked,b.MinimumPaymentAlternativeAmount,
       b.CreditLineTotal,b.CreditLineAvailable,b.Active,b.Note]);
    res.status(201).json({message:'Credit Card record created(be)',data:{CardID:r.insertId,UserCardID:userCardId}});
  }catch(e){ handleDbError(e,res,'Error creating credit card'); }
});

router.put('/cards/:UserCardID',auth,
  param('UserCardID').isInt({min:1}).withMessage('UserCardID must be a positive integer'),
  async(req,res)=>{
    if(!validExpress(req,res)) return;
    const n=normalizeCard(req.body); if(n.error) return bad(res,n.error);
    const b=n.body;
    try{
      const [r]=await pool.query(
        `UPDATE BudgetCardT SET AccountName=?,Last4Digits=?,LastStatementDate=?,StatementBalance=?,
         PaymentDueDate=?,MinimumPaymentDue=?,MinimumPaymentDueChecked=?,MinimumPaymentAlternativeAmount=?,
         CreditLineTotal=?,CreditLineAvailable=?,Active=?,Note=? WHERE UserCardID=? AND UserID=?`,
        [b.AccountName,b.Last4Digits,b.LastStatementDate,b.StatementBalance,b.PaymentDueDate,b.MinimumPaymentDue,
         b.MinimumPaymentDueChecked,b.MinimumPaymentAlternativeAmount,b.CreditLineTotal,b.CreditLineAvailable,
         b.Active,b.Note,Number(req.params.UserCardID),req.user.userId]);
      if(!r.affectedRows) return res.status(404).json({error:'Credit Card record not found(be)'});
      res.json({message:'Credit Card record updated(be)'});
    }catch(e){ handleDbError(e,res,'Error updating credit card'); }
  });

router.delete('/cards/:UserCardID',auth,
  param('UserCardID').isInt({min:1}).withMessage('UserCardID must be a positive integer'),
  async(req,res)=>{
    if(!validExpress(req,res)) return;
    try{
      const [r]=await pool.query('DELETE FROM BudgetCardT WHERE UserCardID=? AND UserID=?',
        [Number(req.params.UserCardID),req.user.userId]);
      if(!r.affectedRows) return res.status(404).json({error:'Credit Card record not found(be)'});
      res.json({message:'Credit Card record deleted(be)'});
    }catch(e){ handleDbError(e,res,'Error deleting credit card'); }
  });

// Monthly budget
function parseMonth(v){
  if(typeof v!=='string'||!/^\d{4}-\d{2}$/.test(v)) return null;
  const [y,m]=v.split('-').map(Number); return m>=1&&m<=12?{y,m}:null;
}
function monthFirst(y,m){ return `${y}-${String(m).padStart(2,'0')}-01`; }
function monthLast(y,m){ return `${y}-${String(m).padStart(2,'0')}-${String(lastDay(y,m-1)).padStart(2,'0')}`; }
function monthLabel(key){
  const [y,m]=key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,1)));
}
function defaultRange(){
  const n=new Date(), s=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),1)), e=addMonths(s,11);
  return {from:`${s.getUTCFullYear()}-${String(s.getUTCMonth()+1).padStart(2,'0')}`,
          to:`${e.getUTCFullYear()}-${String(e.getUTCMonth()+1).padStart(2,'0')}`};
}
function monthRange(from,to){
  const d=defaultRange(); from=from||d.from; to=to||d.to;
  const a=parseMonth(from),b=parseMonth(to);
  if(!a||!b) return {error:'From and To must use YYYY-MM format'};
  if(a.y*12+a.m>b.y*12+b.m) return {error:'To month may not precede From month'};
  return {from,to,fromIso:monthFirst(a.y,a.m),toIso:monthLast(b.y,b.m)};
}
async function recurrenceMap(userId){
  const [rows]=await pool.query('SELECT * FROM BudgetRecurrenceT WHERE UserID=?',[userId]);
  const map=new Map(rows.map(r=>[r.RecurrenceID,{...r,WeeklyDays:[],MonthlyDays:[]}]));
  if(!rows.length) return map;
  const ids=rows.map(r=>r.RecurrenceID), ph=ids.map(()=>'?').join(',');
  const [w]=await pool.query(`SELECT RecurrenceID,DayOfWeek FROM BudgetRecurrenceWeeklyDayT WHERE RecurrenceID IN (${ph})`,ids);
  const [m]=await pool.query(`SELECT RecurrenceID,DayOfMonth,IsLastDay FROM BudgetRecurrenceMonthlyDayT WHERE RecurrenceID IN (${ph})`,ids);
  w.forEach(x=>map.get(x.RecurrenceID)?.WeeklyDays.push(x.DayOfWeek));
  m.forEach(x=>map.get(x.RecurrenceID)?.MonthlyDays.push({DayOfMonth:x.DayOfMonth,IsLastDay:Number(x.IsLastDay)}));
  return map;
}
function addRecurring(target,rows,map,range,s){
  for(const row of rows){
    const rec=map.get(row.RecurrenceID); if(!rec) continue;
    for(const date of occurrences(row[s.start],row[s.end]||null,rec,range.fromIso,range.toIso)){
      target.push({
        Date:date,Direction:s.direction(row),Source:s.source,FromTo:s.fromTo(row),
        Description:s.description(row),Amount:Number(s.amount(row)),Estimated:s.estimated?!!s.estimated(row):false,
        SourceUserID:row[s.userKey],SourceRoute:s.route
      });
    }
  }
}
function cardDates(card,range){
  if(!card.Active||!card.MinimumPaymentDueChecked) return [];
  const start=toDate(card.PaymentDueDate), out=[];
  for(let mi=monthNo(start);mi<=monthNo(toDate(range.toIso));mi++){
    const y=Math.floor(mi/12),m=mi%12,d=safeDate(y,m,start.getUTCDate());
    if(d<start) continue; const x=toIso(d); if(x>=range.fromIso&&x<=range.toIso) out.push(x);
  }
  return out;
}
async function activity(userId,range){
  const map=await recurrenceMap(userId);
  const [[ins],[outs],[subs],[loans],[leases],[ests],[cards]]=await Promise.all([
    pool.query('SELECT * FROM BudgetInT WHERE UserID=? AND Active=1',[userId]),
    pool.query('SELECT * FROM BudgetOutT WHERE UserID=? AND Active=1',[userId]),
    pool.query('SELECT * FROM BudgetSubscriptionT WHERE UserID=? AND Active=1',[userId]),
    pool.query('SELECT * FROM BudgetLoanT WHERE UserID=? AND Active=1',[userId]),
    pool.query('SELECT * FROM BudgetLeaseRentT WHERE UserID=? AND Active=1',[userId]),
    pool.query('SELECT * FROM BudgetEstimateAllowanceT WHERE UserID=? AND Active=1',[userId]),
    pool.query('SELECT * FROM BudgetCardT WHERE UserID=? AND Active=1',[userId])
  ]);
  const a=[];
  addRecurring(a,ins,map,range,{start:'DateBegin',end:'DateEnd',direction:()=> 'In',source:'In',
    fromTo:r=>r.FromName,description:r=>r.Description,amount:r=>r.Amount,estimated:r=>r.Estimated,userKey:'UserInID',route:'in'});
  addRecurring(a,outs,map,range,{start:'DateBegin',end:'DateEnd',direction:()=> 'Out',source:'Out',
    fromTo:r=>r.ToName,description:r=>r.Description,amount:r=>r.Amount,estimated:r=>r.Estimated,userKey:'UserOutID',route:'out'});
  addRecurring(a,subs,map,range,{start:'DateBegin',end:'DateEnd',direction:()=> 'Out',source:'Sub',
    fromTo:r=>r.ToName,description:r=>r.Description,amount:r=>r.Amount,estimated:r=>r.Estimated,userKey:'UserSubscriptionID',route:'subscriptions'});
  addRecurring(a,loans,map,range,{start:'PaymentDateBegin',end:'PaymentDateEnd',direction:()=> 'Out',source:'Loan',
    fromTo:r=>r.FromName,description:r=>r.Description,amount:r=>r.PaymentAmount,estimated:r=>r.PaymentAmountIsEstimated,userKey:'UserLoanID',route:'loans'});
  addRecurring(a,leases,map,range,{start:'PaymentDateBegin',end:'PaymentDateEnd',direction:()=> 'Out',source:'Lease',
    fromTo:r=>r.ToName,description:r=>r.Description,amount:r=>r.PaymentAmount,estimated:r=>r.PaymentAmountIsEstimated,userKey:'UserLeaseRentID',route:'lease-rent'});
  addRecurring(a,ests,map,range,{start:'DateBegin',end:'DateEnd',direction:r=>r.InOrOut,source:'Est',
    fromTo:r=>r.FromNameOrToName,description:r=>r.Description,amount:r=>r.Amount,userKey:'UserEstimateID',route:'estimates'});
  for(const c of cards){
    const amt=c.MinimumPaymentAlternativeAmount!==null?Number(c.MinimumPaymentAlternativeAmount):Number(c.MinimumPaymentDue);
    for(const d of cardDates(c,range)) a.push({
      Date:d,Direction:'Out',Source:'Card',FromTo:c.AccountName,Description:`Credit Card Payment •••• ${c.Last4Digits}`,
      Amount:amt,Estimated:false,SourceUserID:c.UserCardID,SourceRoute:'cards'
    });
  }
  a.sort((x,y)=>x.Direction!==y.Direction?(x.Direction==='In'?-1:1):(x.Date!==y.Date?x.Date.localeCompare(y.Date):String(x.FromTo||'').localeCompare(String(y.FromTo||''))));
  return a;
}

router.get('/monthly/summary',auth,async(req,res)=>{
  const r=monthRange(req.query.from,req.query.to); if(r.error) return bad(res,r.error);
  try{
    const a=await activity(req.user.userId,r), rows=new Map();
    const f=parseMonth(r.from),t=parseMonth(r.to);
    for(let mi=f.y*12+f.m-1;mi<=t.y*12+t.m-1;mi++){
      const y=Math.floor(mi/12),m=mi%12+1,k=`${y}-${String(m).padStart(2,'0')}`;
      rows.set(k,{Month:k,MonthLabel:monthLabel(k),In:0,Out:0,Net:0});
    }
    for(const x of a){
      const k=x.Date.slice(0,7),row=rows.get(k); if(!row) continue;
      if(x.Direction==='In') row.In+=x.Amount; else row.Out+=x.Amount;
    }
    const summary=[...rows.values()].map(x=>({...x,In:Number(x.In.toFixed(2)),Out:Number(x.Out.toFixed(2)),
      Net:Number((x.In-x.Out).toFixed(2)),Deficit:(x.In-x.Out)<0}));
    res.json({from:r.from,to:r.to,summary});
  }catch(e){ handleDbError(e,res,'Error calculating Monthly Budget'); }
});

router.get('/monthly/detail/:year/:month',auth,
  param('year').isInt({min:1900,max:9999}).withMessage('Year is invalid'),
  param('month').isInt({min:1,max:12}).withMessage('Month is invalid'),
  async(req,res)=>{
    if(!validExpress(req,res)) return;
    const k=`${req.params.year}-${String(Number(req.params.month)).padStart(2,'0')}`,r=monthRange(k,k);
    try{
      const a=await activity(req.user.userId,r),incoming=a.filter(x=>x.Direction==='In'),outgoing=a.filter(x=>x.Direction==='Out');
      const ti=incoming.reduce((s,x)=>s+x.Amount,0),to=outgoing.reduce((s,x)=>s+x.Amount,0),net=ti-to;
      res.json({Month:k,MonthLabel:monthLabel(k),In:incoming,Out:outgoing,TotalIn:Number(ti.toFixed(2)),
        TotalOut:Number(to.toFixed(2)),Net:Number(net.toFixed(2)),Deficit:net<0});
    }catch(e){ handleDbError(e,res,'Error calculating Monthly Detail'); }
  });

// Frequency-popup preview, without saving.
router.post('/recurrence/preview',auth,async(req,res)=>{
  const start=req.body.StartDate,end=req.body.EndDate||null,r=normalizeRecurrence(req.body.Recurrence||req.body.recurrence);
  if(!isoDate(start)) return bad(res,'Start Date must be a valid YYYY-MM-DD date');
  const e=validateRecurrence(r,{noNoEnd:!!req.body.DisallowNoEnd}); if(e) return bad(res,e);
  let effective=end;
  if(r.FrequencyType==='OneTime'||r.RangeType==='NoEnd') effective=null;
  else if(r.RangeType==='EndDate'){
    if(!isoDate(end)) return bad(res,'End Date is required');
    if(toDate(end)<toDate(start)) return bad(res,'End Date may not precede Start Date');
  }else if(r.RangeType==='OccurrenceCount'){
    try{ effective=finalOccurrence(start,r); }catch(x){ return bad(res,x.message.replace(/\(be\)$/,'')); }
  }
  const previewEnd=effective||toIso(addYears(toDate(start),2));
  const dates=occurrences(start,effective,r,start,previewEnd);
  res.json({EndDate:effective,Occurrences:dates.slice(0,100),Truncated:dates.length>100});
});

router.get('/health',auth,async(req,res)=>{
  try{
    const u=req.user.userId;
    const [rows]=await pool.query(
      `SELECT
       (SELECT COUNT(*) FROM BudgetInT WHERE UserID=?) AS InCount,
       (SELECT COUNT(*) FROM BudgetOutT WHERE UserID=?) AS OutCount,
       (SELECT COUNT(*) FROM BudgetSubscriptionT WHERE UserID=?) AS SubscriptionCount,
       (SELECT COUNT(*) FROM BudgetLoanT WHERE UserID=?) AS LoanCount,
       (SELECT COUNT(*) FROM BudgetLeaseRentT WHERE UserID=?) AS LeaseRentCount,
       (SELECT COUNT(*) FROM BudgetCardT WHERE UserID=?) AS CardCount,
       (SELECT COUNT(*) FROM BudgetEstimateAllowanceT WHERE UserID=?) AS EstimateCount`,
      [u,u,u,u,u,u,u]);
    res.json({message:'Budget API is available(be)',data:rows[0]});
  }catch(e){ handleDbError(e,res,'Budget API health check failed'); }
});

module.exports = router;

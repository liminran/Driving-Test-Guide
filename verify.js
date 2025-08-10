  const fs=require('fs');const crypto=require('crypto');
  const jws=process.argv[2];const [h,p,s]=jws.split('.');
  const verify=crypto.createVerify('RSA-SHA256');verify.update(`${h}.${p}`);verify.end();
  const ok=verify.verify(fs.readFileSync('public.pem'), Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'),'base64'));
  console.log('verify=',ok);

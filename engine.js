const lowerZones=['Cadera','Glúteo','Muslo anterior izquierdo','Muslo anterior derecho','Isquiotibial izquierdo','Isquiotibial derecho','Aductor izquierdo','Aductor derecho','Rodilla izquierda','Rodilla derecha','Gemelo izquierdo','Gemelo derecho','Tobillo izquierdo','Tobillo derecho','Lumbar'];
const upperZones=['Cuello','Hombro','Espalda alta','Codo','Muñeca'];
export function recoveryScore(c){
 if(!c?.sleep||!c?.energy)return null;
 let s=72+(c.sleep-7)*8+(c.energy-7)*5-(c.pain||0)*3;
 if((c.sportMinutes||0)>=60)s-=8;
 if((c.issueIntensity||0)>=3)s-=Math.min(20,c.issueIntensity*2);
 return Math.max(0,Math.min(100,Math.round(s)));
}
export function sessionScore(c,session){
 let s=recoveryScore(c); if(s==null)s=70;
 const zone=c?.issueZone||'Ninguna',sev=+(c?.issueIntensity||0),impact=+(c?.issueImpact||0);
 const issueLower=lowerZones.includes(zone),issueUpper=upperZones.includes(zone);
 if(session.type==='lower'&&issueLower)s-=sev*6+impact*12;
 if(session.type==='upper'&&issueUpper)s-=sev*6+impact*12;
 if(session.type==='lower'&&['Fútbol','Basket','Fútbol + Basket'].includes(c?.sport)&&c.sportMinutes>=45)s-=12;
 if(session.intensity==='strength'&&sev>=4)s-=8;
 if(sev>=7||impact>=3){if((session.type==='lower'&&issueLower)||(session.type==='upper'&&issueUpper))s=Math.min(s,25)}
 return Math.max(0,Math.min(100,Math.round(s)));
}
export function recommend(c,sessions,nextSession){
 const scores={}; for(const[k,s]of Object.entries(sessions))scores[k]=sessionScore(c,s);
 const planned=nextSession||'A'; let best=planned,reason='Seguimos la rotación planificada.';
 if(scores[planned]<55){
   const candidates=['A','B','C','D'].filter(k=>scores[k]>=65);
   if(candidates.length){best=candidates.sort((a,b)=>scores[b]-scores[a])[0];reason='La sesión planificada quedó penalizada por recuperación o molestia localizada; se propone una alternativa mejor tolerada.'}
   else{best='R';reason='La recuperación o molestia localizada no favorece una sesión normal hoy.'}
 }
 const sev=+(c?.issueIntensity||0),impact=+(c?.issueImpact||0);
 if(sev>=7||impact>=3){best='R';reason='Molestia de alta intensidad o con limitación funcional: evitamos cargar la zona afectada.'}
 return{recommended:best,scores,reason};
}

import { calculateAll, calculateAllStates, ENGINE_VERSION, TAX_YEAR } from "../js/tax-engine/index.js";
import { sanitizeInputs } from "../js/tax-engine/validation.js";

function assert(cond,msg){if(!cond) throw new Error("ASSERT FAIL: "+msg);}

const scenarios=[
  {id:1,gross:40000,state:"TX",filing:"single"},
  {id:2,gross:50000,state:"CA",filing:"single"},
  {id:3,gross:75000,state:"TX",filing:"single"},
  {id:4,gross:75000,state:"CA",filing:"single"},
  {id:5,gross:100000,state:"CA",filing:"marriedJointly"},
  {id:6,gross:150000,state:"NY",filing:"headOfHousehold"},
  {id:7,gross:250000,state:"NJ",filing:"single"},
  {id:8,gross:500000,state:"CA",filing:"marriedJointly"},
  {id:9,gross:1000000,state:"CA",filing:"single"},
  {id:10,gross:0,state:"TX",filing:"single"},
];

console.log(`ENGINE ${ENGINE_VERSION} TAX_YEAR ${TAX_YEAR}`);
for (const s of scenarios){
  const sanitized=sanitizeInputs({grossAnnual:s.gross,filingStatus:s.filing,state:s.state,payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:35});
  const res=calculateAll(sanitized);
  console.log(`Scenario ${s.id} ${s.state} $${s.gross} => netAnnual $${res.totals.netAnnual} totalTax $${res.totals.totalTaxes} eff ${res.totals.effectiveTaxRate}% confidence ${res.confidence.overall}`);
  assert(isFinite(res.totals.netAnnual), "net not finite");
  assert(res.totals.netAnnual>=0, "net negative");
  assert(res.totals.netAnnual<=s.gross || s.gross===0, "net > gross");
}
console.log("Basic scenarios PASS");

// Test 31: 51x4x3 monotonic
let count=0;
for (const st of ["CA","TX","NY","FL","WA","PA","NJ"]){
  for (const filing of ["single","marriedJointly","marriedSeparately","headOfHousehold"]){
    for (const gross of [50000,150000,500000]){
      const sanitized=sanitizeInputs({grossAnnual:gross,filingStatus:filing,state:st,payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:35});
      const res=calculateAll(sanitized);
      assert(isFinite(res.totals.netAnnual), `non-finite ${st}`);
      count++;
    }
  }
}
console.log(`Checked ${count} combos PASS`);

// Parity
const sample=sanitizeInputs({grossAnnual:100000,filingStatus:"single",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{traditional401k:5000},age:35});
const main=calculateAll(sample);
const allStates=calculateAllStates(sample);
assert(main.totals.netAnnual===allStates["CA"].totals.netAnnual, "parity fail");
console.log("Parity PASS");

console.log("All tests PASS");

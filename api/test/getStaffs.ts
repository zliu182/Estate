import { getStaffsAPI } from "../src/methods/getStaffs/index.js";

const getStaffs = await getStaffsAPI.process({});

console.log(JSON.stringify(getStaffs, null, 2));

let votes = {};
let lastDay = new Date().toDateString();


function resetIfNewDay() {
const today = new Date().toDateString();
if (today !== lastDay) {
votes = {};
lastDay = today;
}
}


export default function handler(req, res) {
resetIfNewDay();
res.status(200).json(votes);
}

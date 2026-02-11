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


if (req.method === "POST") {
const { from, to, emoji } = req.body;


if (!votes[to]) votes[to] = [];


votes[to].push({ from, emoji });


return res.status(200).json({ success: true });
}


res.status(405).end();
}

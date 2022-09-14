const { Router } = require('express');
const router = Router();

router.get('/test', (req, res) => {
    const data = {
        "name": "Daniel Zanabria",
        "webService": "Process Audio Full Web Service"
    };
    res.json(data);
});

module.exports = router;
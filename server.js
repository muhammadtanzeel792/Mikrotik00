const express = require('express');
const bodyParser = require('body-parser');
const { RouterOSClient } = require('node-routeros');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 🔹 Router config (APNI DETAILS DALO)
const routers = [
    {
        name: "Router1",
        host: "149.71.39.44",
        user: "Tanzeel",
        password: "@Tanzeel1122",
        port: 8728
    }
];

// Home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Action
app.post('/action', async (req, res) => {
    const { router, voucher, action } = req.body;

    const selectedRouter = routers.find(r => r.name === router);
    if (!selectedRouter) return res.send("Router not found");

    const conn = new RouterOSClient({
        host: selectedRouter.host,
        user: selectedRouter.user,
        password: selectedRouter.password,
        port: selectedRouter.port
    });

    try {
        await conn.connect();

        // SEARCH
        if (action === 'search') {
            const result = await conn.write('/ip/hotspot/user/print', [
                '?name=' + voucher
            ]);
            await conn.close();
            return res.send(JSON.stringify(result));
        }

        // ENABLE
        if (action === 'enable') {
            await conn.write('/ip/hotspot/user/enable', [
                '=numbers=' + voucher
            ]);
        }

        // DISABLE
        if (action === 'disable') {
            await conn.write('/ip/hotspot/user/disable', [
                '=numbers=' + voucher
            ]);
        }

        // RESET
        if (action === 'reset') {
            await conn.write('/ip/hotspot/user/reset-counters', [
                '=numbers=' + voucher
            ]);
        }

        await conn.close();
        res.send(`Action ${action} done on ${voucher}`);

    } catch (err) {
        console.log(err);
        res.send("Error: " + err.message);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});

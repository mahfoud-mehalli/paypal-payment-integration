const express = require("express");
const paypal = require("paypal-rest-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());

paypal.configure({
  "mode": "sandbox",
  "client_id": process.env.PAYPAL_CLIENT_ID,
  "client_secret": process.env.PAYPAL_CLIENT_SECRET,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/payment", async (req, res) => {
  try {
    let create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:8000/success",
        cancel_url: "http://localhost:8000/failed",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "item",
                sku: "001",
                price: "1.00",
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: "1.00",
          },
          description: "This is the payment description.",
        },
      ],
    };

    await paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.log(error);
        throw error;
      } else {
        console.log(payment);

        let data = payment;
        res.json(data);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/success", async (req, res) => {
  try {
    console.log(req.query);

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const express_checkout_json = {
      "payer_id": payerId,
      "transactions": [
        {
          "amount": {
            "currency": "USD",
            "total": "1.00",
          },
          "description": "This is the payment description.",
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      express_checkout_json,
      function (error, payment) {
        if (error) {
          console.log(error);
          return res.redirect("http://localhost:5173/failed");
        } else {
          const response = JSON.stringify(payment);
          const ParsedResponse = JSON.parse(response);

          console.log(ParsedResponse);
 
          return res.redirect("http://localhost:5173/success");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.get("/failed", async (req, res) => {
  return res.redirect("http://localhost:5173/failed");
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
  console.log(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
});

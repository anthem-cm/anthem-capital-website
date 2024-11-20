require("dotenv").config(); // Подключение переменных окружения
const express = require("express");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");

const app = express();
const PORT = 3000;

// Устанавливаем API-ключ для SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware для обработки данных формы
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Функция для отправки email
const sendEmail = async (userEmail) => {
    const msg = {
        to: "v.dranov450@gmail.com", // Подтверждённый email (Single Sender Verification)
        from: "v.dranov450@gmail.com", // Тот же подтверждённый email
        subject: "New Email Subscription",
        html: `<strong>A new user has subscribed with the email: ${userEmail}</strong>`,
    };

    try {
        await sgMail.send(msg);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error.response.body.errors);
        throw error;
    }
};

// Маршрут для обработки подписки
app.post("/subscribe", async (req, res) => {
    const userEmail = req.body.email;

    if (userEmail) {
        try {
            await sendEmail(userEmail);
            res.status(200).send("Subscription successful!");
        } catch (error) {
            res.status(500).send("Failed to send email.");
        }
    } else {
        res.status(400).send("Invalid email address.");
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
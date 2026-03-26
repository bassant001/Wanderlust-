# 🌍 Wanderlust – Travel Explorer Web App

## 📌 Overview

**Wanderlust** is a web application that helps users explore countries, discover events, public holidays, weather conditions, and plan trips efficiently.

The system integrates multiple APIs to provide a rich, real-time travel experience, allowing users to browse destinations and save their favorite plans.

---

## 🚀 Features

* 🌎 Explore countries and cities dynamically
* 🎉 Discover events using Ticketmaster API
* 📅 View public holidays by country and year
* ☁️ Real-time weather data
* 🌅 Sunrise & sunset times
* 🧳 Save favorite plans (holidays, events, long weekends)
* 💱 Currency conversion system
* 🕒 Live local time based on selected country

---

## 🧠 System Design

The application is built using modular JavaScript with dynamic DOM rendering and API-driven data.

### 🔹 Core Components

* **Country Selection System**

  * Dynamic dropdown for countries and cities
  * Updates UI based on selected destination

* **Favorites System**

  * Stores user preferences using `localStorage`
  * Supports:

    * Holidays
    * Events
    * Long weekends

* **API Integration**

  * Multiple external APIs combined into one system:

    * Countries API
    * Holidays API
    * Events API
    * Weather API
    * Sunrise/Sunset API
    * Exchange Rates API

---

## ⚙️ Technologies Used

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* REST APIs
* LocalStorage

---

## 📂 Project Structure

```
src/
├── css/
├── js/
│   ├── main.js
│   ├── api logic
│   ├── UI rendering
│   └── storage handling
index.html
```

---

## 💻 How It Works

1. User selects a country and city
2. The system fetches:

   * Country details
   * Events
   * Holidays
   * Weather
3. Data is rendered dynamically
4. User can save favorites
5. Favorites are stored locally and displayed later

---

## ⚠️ Notes

* This project was developed as part of a learning journey
* The system is still under development and improvements are ongoing

---

## 🏁 Conclusion

Wanderlust demonstrates how multiple APIs and front-end logic can be combined to create a real-world, interactive travel application.

It reflects strong problem-solving skills, API handling, and dynamic UI development using JavaScript.

---

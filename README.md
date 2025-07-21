# Connecto 🔗

A full-stack authentication app built using **React + Vite** frontend and **Node.js + Express** backend. Includes:
- React Hook Form for form handling (no useState)
- Google login integration
- JWT-based authentication
- Encrypted passwords using bcrypt
- MongoDB database
- Post-login user redirection
- Component-based folder structure

---

## 🛠️ Frontend Tech Stack

- React (Vite)
- Tailwind CSS (for styling)
- React Hook Form
- React Router DOM
- Axios (API communication)

### 🔄 Features
- ✅ Sign up / Login with form (validated via `react-hook-form`)
- ✅ Google OAuth login
- ✅ After login → redirects to `/home` page and displays user details
- ✅ Reusable components (Buttons, Layouts)
- ✅ Proper component structure (e.g., `<LeftSection />`, `<CustomButton />`)

---

## ⚙️ Backend Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt (password hashing)
- jsonwebtoken (JWT for secure auth)

### 🔐 Auth Flow
1. **Signup/Login:** Data sent to backend
2. **Password encryption:** Done via `bcrypt`
3. **JWT:** Sent to frontend as token (stored in cookies/localStorage)
4. **Protected routes:** Checked via middleware
5. **Google Login:** Google account is authenticated via OAuth (Google Cloud Console)

---

## 📦 Installation

### 1. Clone the repo
```bash
git clone https://github.com/wareeshayyyyy/Connecto.git

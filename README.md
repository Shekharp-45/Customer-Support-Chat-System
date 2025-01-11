# Customer-Support-Chat-System

This project contains both a frontend and backend, and they can be run simultaneously using the `concurrently` npm package.

## Prerequisites

Before running the project, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup

1. **Clone the repository:**

   Clone this project to your local machine.

   ```bash
   git clone https://your-repository-url.git
   cd your-project-folder
   ```

2. **Install dependencies:**

   There are two parts in your project (frontend and backend). The dependencies for both need to be installed.

   - **Frontend Dependencies:**

     Navigate to the frontend folder and install dependencies.

   
     cd client
     npm install

   - **Backend Dependencies:**

     Similarly, navigate to the backend folder and install dependencies.

     cd ../server
     npm install

3. **Setup `.env` files:**

   Both the frontend and backend may require environment variables. Ensure you have created `.env` files in the respective directories if needed. 

   - For the backend, ensure you set the necessary environment variables such as database connections, API keys, etc.
   - For the frontend, you may have variables such as API URLs, keys, etc.

## Running the Project
![Screenshot (257)](https://github.com/user-attachments/assets/3f2a1a4b-74f1-4366-a30e-376e2e9929b5)


To run both the frontend and backend simultaneously, the `concurrently` npm package is used.

1. **Navigate to the root of the project:**

   cd ..

2. **Run the project:**

   Simply run the following command in the root directory:

   npm run dev

   This command will use `concurrently` to run both the frontend and backend at the same time.


## Scripts

Here are the npm scripts that are defined for your project:

- `npm run dev` – Run both frontend and backend concurrently.
- `npm run frontend` – Start only the frontend.
- `npm run backend` – Start only the backend.

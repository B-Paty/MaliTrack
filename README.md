# QSA Ledger Zen

A simple accounting app for Tanzania. Think of it like a tidy notebook that helps you keep money records nicely.

### What you can do
- See your list of accounts (like Cash, Bank, Rent).  
- Add journal entries (money in, money out) that must balance.  
- See a Trial Balance and Financial Statements.  
- Make Invoices and export them to PDF.  
- Change company name, logo, brand color, and payment settings (Bank and Vodacom Lipa Namba).  

### How to run (3 steps)
1) Install tools
```bash
npm i
```
2) Start the app
```bash
npm run dev
```
3) Open the link it shows (usually http://localhost:5173)

### How to use (like a 6‑year‑old)
- The big left menu is your “rooms”. Tap a room to go there.  
- “Chart of Accounts” is your list of money boxes.  
- “Journal Entry” is where you write a new note about money moving. The left must equal the right.  
- “Trial Balance” checks your math.  
- “Financial Statements” shows totals and lets you save a PDF.  
- “Invoices” lets you make a bill and save it as a PDF.  
- “Company Settings” lets you pick your name, color, logo, and how people pay you.

### Payment settings
- Go to Company Settings → Payment Settings.  
- Fill in Bank (name, account, number).  
- Fill in Vodacom Lipa Namba (business name, number).  
- The invoice shows both side‑by‑side with small pictures.  
- Default images live in `public/images/` – you can replace them.

### Currency and format
- All money is shown as “Tsh 12,345” (whole numbers).  

### Live dashboard
- Quick Actions buttons jump to other rooms.  
- Recent Activities shows latest transactions.  
- Monthly Progress shows this month’s revenue and how busy you were.  

### Data
- The app uses Supabase (a Postgres database).  
- Tables: `chart_of_accounts`, `transactions`, `transaction_lines`, `company_settings`.  
- `company_settings.payment_settings` keeps your pay details as JSON.  

### Tech
- React + TypeScript + Vite  
- Tailwind + shadcn/ui  
- Supabase (auth ready, no UI yet)  

### Tips
- Stuck? Refresh the page.  
- Want a different brand color? Pick a preset or set your own; it changes instantly.  
- Need to change payment images? Put new files in `public/images/` and update the URLs in Payment Settings.  

### Contributing
- Edit code in `src/`.  
- UI parts live in `src/components/`.  
- Hooks to talk to the database live in `src/hooks/`.  

### Safety
- Do not commit real secrets. The Supabase anon key is public by design, but rotate keys for production.  

Have fun keeping your books tidy! 🧮✨

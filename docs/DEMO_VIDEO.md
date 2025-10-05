# 🎥 Expensify Demo Video - Outline and Script

## Video Details

- **Target Duration**: 3-5 minutes
- **Format**: Screen recording with voiceover
- **Resolution**: 1080p (1920x1080) minimum
- **Recording Tools**: OBS Studio, Loom, or Windows Game Bar

## 📋 Pre-Recording Checklist

- [ ] Clear browser cookies/localStorage
- [ ] Reset database to have clean slate
- [ ] Prepare 3-5 sample expenses
- [ ] Test microphone audio quality
- [ ] Close unnecessary browser tabs
- [ ] Set zoom to 100% in browser
- [ ] Prepare notes for smooth narration

## 🎬 Video Structure

### Opening (0:00 - 0:30)

**Scene**: Landing page

**Actions**:
- Show homepage at http://localhost:3000
- Briefly scroll to show features section

**Script**:
> "Hello! Welcome to Expensify, a modern expense tracking application. Today I'll demonstrate all the key features including user authentication, expense management, and advanced filtering capabilities. Let's get started!"

**Focus Points**:
- Briefly mention technology stack (Next.js, Prisma, PostgreSQL)
- Show professional landing page design

---

### Part 1: User Registration (0:30 - 1:00)

**Scene**: Registration page

**Actions**:
1. Click "Get Started" button
2. Navigate to registration form
3. Fill in email: `demo@expensify.com`
4. Fill in password: `Demo@123`
5. Fill in confirm password: `Demo@123`
6. Click "Sign Up"
7. Show automatic redirect to dashboard

**Script**:
> "First, let's create an account. I'll click 'Get Started' and register with an email and password. Notice the password confirmation field for security. After submitting, the system automatically logs me in and redirects to the dashboard."

**Focus Points**:
- Password confirmation validation
- Smooth transition to dashboard
- JWT token authentication (mention but don't show)

---

### Part 2: Creating Expenses (1:00 - 2:00)

**Scene**: Dashboard - Create expense form

**Actions**:
1. Show empty dashboard
2. Fill first expense:
   - Description: "Business Lunch"
   - Base Amount: 1500
   - Tax Rate: 0.18
   - Category: Food
   - Is Reimbursed: Unchecked
3. Click "Create Expense"
4. Point out the calculated total (1770)
5. Create second expense:
   - Description: "Flight to Mumbai"
   - Base Amount: 8500
   - Tax Rate: 0.05
   - Category: Travel
   - Is Reimbursed: Checked
6. Click "Create Expense"
7. Create third expense:
   - Description: "Office Supplies"
   - Base Amount: 2500
   - Tax Rate: 0.18
   - Category: Office
   - Is Reimbursed: Unchecked

**Script**:
> "Let's create our first expense. I'll add a business lunch with a base amount of 1500 and an 18% tax rate. Notice how the total amount is automatically calculated - 1770. That's our calculated field in action: base amount plus tax.
>
> Now I'll add a travel expense - a flight to Mumbai. This one is already reimbursed, so I'll check that box. The system supports four categories: Food, Travel, Office, and Other.
>
> Let me add one more - office supplies. This demonstrates our enum field for categories and the boolean field for reimbursement status."

**Focus Points**:
- Calculated field: total_amount = base_amount + (base_amount × tax_rate)
- Enum field: Category (Food, Travel, Office, Other)
- Boolean field: is_reimbursed
- Text field: description
- Success messages after creation

---

### Part 3: Viewing and Editing (2:00 - 2:30)

**Scene**: Dashboard - Expense table

**Actions**:
1. Show the expense table with all entries
2. Point out different fields (description, category, amounts, status)
3. Click "Edit" on Business Lunch expense
4. Change description to "Client Lunch Meeting"
5. Change is_reimbursed to checked
6. Click "Update Expense"
7. Show updated entry in table

**Script**:
> "Here's our expense table showing all the details. Each expense displays the description, category, base amount, tax rate, calculated total, and reimbursement status.
>
> Let's edit the first expense. I'll click the edit button, update the description to 'Client Lunch Meeting', and mark it as reimbursed. The form updates instantly and our changes are saved."

**Focus Points**:
- Full CRUD operations (Create, Read, Update demonstrated)
- Clean table design with color-coded status badges
- Smooth edit workflow

---

### Part 4: Search and Filtering (2:30 - 3:15)

**Scene**: Dashboard - Search and filter controls

**Actions**:
1. Type "lunch" in search box
2. Show filtered results (1 result)
3. Clear search
4. Select "Travel" from category filter
5. Show filtered results (1 result)
6. Clear category filter
7. Select "Reimbursed" from status filter
8. Show filtered results (2 results showing reimbursed)
9. Clear all filters

**Script**:
> "Now let's explore the search and filtering features. I'll search for 'lunch' and the system performs a case-insensitive search through expense descriptions.
>
> I can also filter by category - let's select Travel. Now only travel expenses appear. 
>
> Another useful filter is the reimbursement status. Let me filter to show only reimbursed expenses. These features make it easy to find specific expenses in a large dataset."

**Focus Points**:
- Case-insensitive search
- Category filtering (demonstrate Enum usage)
- Boolean filtering (reimbursement status)
- Instant results without page reload

---

### Part 5: Sorting (3:15 - 3:45)

**Scene**: Dashboard - Sort controls

**Actions**:
1. Show current default sort (Date - Descending)
2. Change sort to "Base Amount" - Descending
3. Show expenses reordered (highest amount first)
4. Change sort order to Ascending
5. Show expenses reordered (lowest amount first)
6. Change sort to "Description" - Ascending
7. Show alphabetically sorted expenses
8. Change sort back to "Date" - Descending

**Script**:
> "The sorting feature lets us organize expenses in multiple ways. By default, expenses are sorted by date with newest first.
>
> Let me sort by base amount in descending order - now the highest expenses appear first. If I switch to ascending order, the lowest expenses come up top.
>
> I can also sort alphabetically by description, or group by category. This flexibility helps analyze spending patterns."

**Focus Points**:
- Multiple sort fields (date, amount, description, category)
- Ascending and descending order
- Smooth sorting without page reload

---

### Part 6: Pagination (3:45 - 4:15)

**Scene**: Dashboard - Pagination controls

**Note**: You'll need to create 12+ expenses for this to work

**Alternative Actions** (if you don't want to create many expenses):
1. Show pagination controls at the bottom
2. Mention "If we had more than 10 expenses, we'd see page navigation"
3. Point out the "Showing page X of Y" text

**Script**:
> "For large expense lists, the system includes pagination. Currently, we display 10 expenses per page. If we had more, we'd see Next and Previous buttons here to navigate through pages. The system shows the current page, total pages, and total expense count for easy navigation."

**Focus Points**:
- Pagination metadata (current page, total pages, total count)
- Configurable page size (default 10)
- Next/Previous navigation

---

### Part 7: Delete Operation (4:15 - 4:30)

**Scene**: Dashboard - Expense table

**Actions**:
1. Click "Delete" button on one expense
2. Show confirmation dialog
3. Click "OK" to confirm
4. Show expense removed from list
5. Success message appears

**Script**:
> "Finally, let me demonstrate the delete operation. Clicking the delete button shows a confirmation dialog to prevent accidental deletions. After confirming, the expense is permanently removed from the database. This completes our CRUD operations - Create, Read, Update, and Delete."

**Focus Points**:
- Confirmation dialog for safety
- Immediate UI update after deletion
- Full CRUD cycle completed

---

### Part 8: Logout and Closing (4:30 - 5:00)

**Scene**: Dashboard → Login page → Landing page

**Actions**:
1. Click "Logout" button
2. Show redirect to login page
3. Navigate to home page
4. Show landing page again

**Script**:
> "Let's logout to see the authentication flow. Clicking logout clears the JWT token and redirects to the login page. 
>
> To summarize, Expensify demonstrates:
> - Secure user authentication with JWT
> - Full CRUD operations on expenses
> - A calculated field for total amounts
> - Enum, boolean, and text field types
> - Pagination for large datasets
> - Filtering by category and status
> - Search functionality
> - And flexible sorting options
>
> The application is built with Next.js, Prisma ORM, and PostgreSQL, following modern web development best practices. Thank you for watching!"

**Focus Points**:
- Secure logout (token removal)
- Summary of all features demonstrated
- Technology stack mention
- Professional closing

---

## 📊 Features Checklist (Ensure All Demonstrated)

### Mandatory Requirements
- [x] User authentication (registration & login)
- [x] Create expense (POST)
- [x] Read expenses (GET list)
- [x] Update expense (PUT)
- [x] Delete expense (DELETE)
- [x] Text field: description
- [x] Boolean field: is_reimbursed
- [x] Enum field: category (Food, Travel, Office, Other)
- [x] Calculated field: total_amount = base_amount + (base_amount × tax_rate)
- [x] Pagination: page controls
- [x] Filtering: by category and reimbursement status

### Bonus Features
- [x] Search: by description
- [x] Sorting: by date, amount, description, category (ascending/descending)

---

## 🎙️ Recording Tips

### Audio
- Speak clearly and at a moderate pace
- Avoid filler words (um, uh, like)
- Pause briefly between sections
- Record in a quiet environment
- Use a good quality microphone

### Video
- Use 1080p resolution minimum
- Keep browser at 100% zoom
- Close unnecessary tabs
- Disable browser extensions that might interfere
- Show cursor movements clearly
- Don't rush through actions

### Editing
- Add smooth transitions between sections
- Include timestamps or section labels
- Add background music (optional, keep volume low)
- Use screen annotations to highlight important features
- Export in high quality (H.264, MP4 format)

---

## 🎬 Post-Production Checklist

- [ ] Video is 3-5 minutes long
- [ ] Audio is clear and audible
- [ ] All mandatory features are demonstrated
- [ ] Both bonus features are shown
- [ ] Video quality is 1080p
- [ ] No sensitive information visible (API keys, personal data)
- [ ] Video exported in MP4 format
- [ ] File size is reasonable (under 500MB)

---

## 📤 Upload Instructions

1. **YouTube** (Recommended):
   - Upload as unlisted or public
   - Add title: "Expensify - Expense Tracking Application Demo"
   - Add description with tech stack and features
   - Add tags: Next.js, Prisma, PostgreSQL, React, Expense Tracker

2. **Google Drive** (Alternative):
   - Upload MP4 file
   - Set sharing to "Anyone with the link"
   - Get shareable link

3. **Loom** (Quick option):
   - Record directly with Loom
   - Share the Loom link

---

## 🎯 Success Criteria

Your demo video should clearly show:
1. ✅ Working authentication system
2. ✅ All CRUD operations functional
3. ✅ Calculated field (total_amount) working
4. ✅ Enum field with 4 categories
5. ✅ Boolean field for reimbursement
6. ✅ Text field for description
7. ✅ Pagination UI (even if not fully exercised)
8. ✅ Filtering by category and status
9. ✅ Search functionality
10. ✅ Sorting by multiple fields

---

## 💡 Alternative: Quick Demo Script (2-3 minutes)

If you want a shorter video:

1. **Opening** (0:00-0:15): Show landing page, mention tech stack
2. **Authentication** (0:15-0:30): Quick registration and login
3. **CRUD Operations** (0:30-1:30): Create 2 expenses, edit 1, delete 1
4. **Advanced Features** (1:30-2:30): Quick demo of search, filter, sort
5. **Closing** (2:30-2:45): Summary and logout

---

Good luck with your demo video! 🎥✨

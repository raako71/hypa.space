# PHIL Web App. Built in React + Vite
10 Jan.
Update Username fully working. 
-Cloud functions to validate unique username and auth for API. 
-Create userID document in database.

11 Jan.
Disallow update username if mismatch between databases, check for username existance in personal db. (harden security based on user write capabilities).
Move Auth componenet into login.
Add react router.
Delete username when deleting user.

19 Jan.
Add phone number to User Account

24 Jan.
New Product works.

26 Jan.
Passing images to New Product page, with cropping and scaling. Ready to be linked to product document.

27 Jan.
Pass individual images to New Product Component. Upload Images to firebase

30 Jan.
Organise new product component
Update category selector

31 Jan.
Load Global categories, inc sub-subcategories
Save categories to user doc and product

1 Feb.
Load user categories in category selector.

3 Feb:
Input filter for all new product fields. Only upload images if present. Empty product name error. error: require category/sub category. Display "saving" when clicked. Show error if required. Redirect to product page if save success.

REMAINING:
Modify product name for no spaces.

modify category objects for name key

Add products to an object in user doc for indexing by category.

Products page with sorting by category.

Individual Product Page.
Edit Product Page.
Delete Photos, add more photos to product.
Select default image for Products.

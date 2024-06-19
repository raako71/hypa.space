# PHIL Web App. Built in React + Vite
Commands:
Local: 
    npm run dev
Cloud: 
    npm run build  
    push to cloud: firebase deploy

REMAINING: 
* Edit images.
* Resize L image on upload (origional aspect). Use JPG compression.
* Store Image
* Store name as url.
* Show stores on front page



* Delete Photos, add more photos to product.
* Select default image for Products.


* Delete product, and update user category tree accordingly etc.
* Update user category tree on edit product.

* ensure blank image loads for no image in ProdBox (isolated components)


19 June:
Store Name

18 June:
Bugs

4 May:
Edit button working.

1 May:
Carousel for product page.

29 Apr:
Load New product correctly. Product page with images.

28 Apr:
Title for ProdBox is product link.

24 Apr:
Image placeholder for no image (better).

23 Apr:
Image placeholder for no image.
Remove add categories from products page.
Add products to header.

22 Apr:
Choose how many products to show, sort into pages.

20 Apr:
Lightbox in productBox

19 Apr:
Show images on product page.

17 Apr:
Show category dropdowns dynamiacally on product page.

10 Feb: 
Load categories from user doc and merge with global categories.
Save item to productTree object in userdoc (same as CategoryTree without name key).
Individual Product Page.

7 Feb: 
Load sub categories in editor.
Load sub sub.
Add new of each, and handling for each case.
Pass category data to parent.
Save Category to user doc and merge.

3 Feb:
Input filter for all new product fields. Only upload images if present. Empty product name error. Require category/sub category error. Display "saving" when clicked. Show error if required. Redirect to product page if save success. Modify product name for no spaces.

1 Feb.
Load user categories in category selector.

31 Jan.
Load Global categories, inc sub-subcategories
Save categories to user doc and product

30 Jan.
Organise new product component
Update category selector

27 Jan.
Pass individual images to New Product Component. Upload Images to firebase

26 Jan.
Passing images to New Product page, with cropping and scaling. Ready to be linked to product document.

24 Jan.
New Product works.

19 Jan.
Add phone number to User Account

11 Jan.
Disallow update username if mismatch between databases, check for username existance in personal db. (harden security based on user write capabilities).
Move Auth componenet into login.
Add react router.
Delete username when deleting user.

10 Jan.
Update Username fully working. 
-Cloud functions to validate unique username and auth for API. 
-Create userID document in database.

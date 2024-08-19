# PHIL Web App. Built in React + Vite
(Project Harry In Lima). Build becuase online shopping is completly non functional in Peru, even domestically so many issues. Mercado libre doesnt allow stores to communicate with customers (at least easily). At time of inception lack of intergation between all possible delivery networks. Goal to add whitelabelling with domain integration.

Commands:
Local: 
    npm run dev
Cloud: 
    npm run build  
    push to cloud: firebase deploy

REMAINING:
* cannot delete images.

* Email verification (required for store).

* Store breadcrums for product page. -> links a queries in URL for products component

* Delete account (email auth) (function) -> delete all products & images.

* Delete Products in bulk (advanced page), add repair button.

* What happens if you try edit someone elses product.

16 July:
Save/update/delete debugged.
Catch error for editing other users product.
Only load user cats for Product page.

15 July:
New code for save/ update.

14 July:
Delete product is convoluted:
deleteAProduct function.
cleanProdTree function.
pruneCategoryTree exists and works.

13 July:
Confirm delete product.
Rebuild user category trees button (whoops).

3 July:
Delete product!
Update Categories on product modified.
Move to VPS.

1 July:
Delete Photos from product.
Disable LightBox slider arrows for single image.
Various bugs.

30 June:
Update store doc when updating user account (validation etc).
Show stores on front page from stores document.

29 June:
UpdateStore Function.

28 June:
Create updateStore function.
StoreBox component.

27 June:
Show Store info.
Store loads products.

26 June:
Store name as url

24 June:
Pass auth data from app root, reduce reads

23 June:
Load sub cats in product page.

22 June:
Load existing images to product editor, allow adding more.

21 June:
Store Image.

20 June:
Scale images to JPG.

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


Site Features:
Each user can create a store with a unique username.

const About = () => {

    return (
        <>
            <div className="article">
                <h1>About</h1>
                <p>This webstore is built on React and currently under development. 
                    It explores a new web-store platform concept, offering features 
                    not currently offered by online market places such as Mercado Libre.
                </p>
                <p>Some of the more complex features of this site include product category management,
                    where a user can add their own sub and sub-sub categories for each product. 
                    When a new product is created, or deleted, the user product tree is 
                    updated accordingly. This will then allow relavant filtering on the product page.
                </p>
                <p>Some of the specific features which motivated the creation of such a platform include:
                </p>
                <ul><li>Allowing stores to list their contact details.</li>
                    <li>White Label oppertunity for custom store domains integrating domain name
                        provider API (not completed).</li>
                    <li>Integration of both immediate delivery methods for short range delivery with 
                        traditional carriers for longer distance delivery (not completed).</li></ul>
                <p>In regard to React development, this app allows users to:</p>
                <ul>
                    <li>Create a user account by email.</li>
                    <li>Create a store with a unique username.</li>
                    <li>Create Products with images and variations.</li>
                    <li>List their store as an extension of the site URL.</li>
                    <li>Filter products by category and select number of products per page.</li>
                    <li>Show product images in a slider element, with fullscreen lightbox functionality.</li>
                </ul>
                <p>Tehcnically this store includes the following features:</p>
                <ul>
                    <li><b>Image and database hosting</b> with Google Firebase.</li>
                    <li>User authentication with Google firebase, including email validation
                        and password reset.</li>
                    <li><b>Firebase functions</b> to validate unique username creation.</li>
                    <li>User store functionality, with stores shown in site url.</li>
                    <li>User and global product categories, with product sorting.</li>
                    <li>Product creation, with:<ul>
                        <li>Image attachment, scaling, and upload to cloud storage.</li>
                        <li>Image deletion (local cache and cloud).</li>
                        <li>Product variations.</li>
                        <li>Product editing and deletion.</li>
                    </ul></li>
                    <li>Store visibility switch in account settings.</li>
                    <li>Store contact details.</li>
                </ul>
            </div >

        </>
    )
}

export default About
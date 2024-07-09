const About = () => {

    return (
        <>
            <div className="article">
                <h1>About</h1>
                <p>This webstore has been built as an excercise in learning React,
                    and to explore a new web-store platform concept, to create a webstore with
                    features not currently offered by online market places such as Mercado Libre.
                </p>
                <p>At present this store is purely an excercise in react development, and contains
                    minimal stying.
                </p>
                <p>Some of the more complex features of this site include global user categories, and customisable
                    user categories, with sub and sub-sub categories. Products are filterable by category, where
                    the user category tree is dynamically updated when items are added or deleted.
                </p>
                <p>The idea of this web-store platform came about with the intention
                    to host specific features, including:
                </p>
                <ul><li>Allowing stores to list their contact details.</li>
                    <li>White Label oppertunity to allow custom domains for webstores through domain name
                        provider API integration (not completed).</li>
                    <li>Integration of all available delivery methods, immediate local and longer distance (not completed).</li></ul>
                <p>In regard to React development, this app is functional and allows users to:</p>
                <ul>
                    <li>Create a user account by email.</li>
                    <li>Create a store with a unique username.</li>
                    <li>Create Products with images and variations.</li>
                    <li>List their store as part of the site url using their username.</li>
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
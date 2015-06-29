servantProductConversion = function(syncProduct) {

    Sync.data.tagArray = [];

    Servant.instantiate('product', function(error, response) {
        if (error) console.log(error);
        else Sync.data.product = response;
    });

    try {
        // Converts Etsy servantProduct title. Ensures max length 130 characters
        if (syncProduct.title.length <= 130) Sync.data.product.name = syncProduct.title;
        else Sync.data.product.name = syncProduct.title.slice(0, 129);

        // Converts Etsy servantProduct description. Ensures max length 5000 characters
        if (syncProduct.description.length <= 5000) Sync.data.product.description = syncProduct.description;
        else Sync.data.product.description = syncProduct.description.slice(0, 4999);

        // Records the Etsy servantProduct's public access state. Removed is the only state where a servantProduct is not published at all
        if (syncProduct.state === "removed") Sync.data.product.public_access = false;

        // Converts Etsy servantProduct price to a whole number in cents
        if (syncProduct.price) Sync.data.product.price = syncProduct.price * 100;

        // Picks the broadest Etsy category the servantProduct is classified under
        if (syncProduct.category_path.length) {

            async.eachLimit(syncProduct.category_path[0], 1, tagCheck, function(err)) {
                console.log(err);
            }
        }

        Sync.data.product.category = Sync.data.tagArray;

        // Picks the most specific category the servantProduct is classified under
        if (syncProduct.category_path.length > 1) {

            async.eachLimit(syncProduct.category_path[syncProduct.category_path.length - 1], 1, tagCheck, function(err)) {
                console.log(err);
            }

            Sync.data.product.subcategory = Sync.data.tagArray;
        }

        // Allows up to 30 tags to be recorded
        if (syncProduct.tags.length > 30) var truncTags = syncProduct.tags.slice(0, 29);
        else var truncTags = syncProduct.tags;

        async.eachLimit(truncTags, 5, tagCheck, function(err)) {
            console.log(err);
        }

        // Save tag IDs to instantiated product record
        Sync.data.product.tags = Sync.data.product.tags.concat(Sync.data.tagArray);

        // Records currency code
        if (syncProduct.currency_code) Sync.data.product.currency = syncProduct.currency_code;

        // Records whether the servantProduct is in stock. In stock is not an Etsy property
        if (syncProduct.quantity = 0) Sync.data.product.in_stock = true;

        // Records the audience of the Etsy servantProduct. Etsy only allows one recipient/audience to be designated
        if (syncProduct.recipient) Sync.data.product.audience[0] = syncProduct.recipient[0];

    } catch (err) {

        console.log(err);
    }

    Servant.validate('product', Sync.data.product, function(error, product) {

        Servant.saveArchetype(Sync.data.access_token, servantID, 'product', product, function(error, response) {
            console.log(error, response);
        });
    });
};

// Check if a tag already exists within Servant.  If not, create a new record.
tagCheck = function(tag) {

    var criteria = {
        query: {
            tag: tag
        },
        sort: {},
        page: 1
    };

    Servant.queryArchetypes(Sync.data.access_token, servantID, 'tag', criteria, function(error, response) {
        console.log(error, response);

        if (response.length) Sync.data.tagArray.push(response._id);
        else {
            tagSave(tag, function() {
                tagCheck(tag);
            });
        }
    });
};

// Save a tag as a new tag record within Servant
tagSave = function(tag, callback) {

    Servant.instantiate('tag', function(error, response) {
        if (error) console.log(error);
        else Sync.data.newTag = response;
    });

    try {

        if (tag.length < 140) Sync.data.newTag.tag = tag;
        else console.log("Tag length too long - not recorded");

    } catch (err) {

        console.log(err);
    }

    Servant.validate('tag', Sync.data.newTag, function(error, tag) {

        Servant.saveArchetype(Sync.data.access_token, servantID, 'tag', tag, function(error, response) {
            console.log(error, response);
        });
    });

    if (callback) return callback();
};







var test_object = {};

test_object.title = titletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitle;
test_object.description = abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz;
test_object.state = "active";
test_object.price = "3.14";
test_object.category_path = ["Shoes", "Formal", "Heels"];
test_object.tags = ["tag1", "tag2", "tag3", "tag4"];
test_object.currency_code = "USD";
test_object.quantity = 0;
test_object.recipient = ["Women", "Adults"];

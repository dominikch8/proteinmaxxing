const productsDatabase = enrichProducts(
    typeof productsDatabaseRaw !== 'undefined'
        ? productsDatabaseRaw
        : (typeof productsDatabaseLite !== 'undefined' ? productsDatabaseLite : [])
);

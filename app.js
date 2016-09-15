var express     = require("express"),
    http        = require("http"),
    request     = require("request"),
    app         = express(),
    bodyParser  = require("body-parser");

var port    = process.env.PORT,
    ip      = process.env.IP;
    
var fkApi = 'https://affiliate-api.flipkart.net/affiliate/1.0/search.json',
    fkId = 'mgopitrin',
    fkToken = 'b0ecf68369bd46c6b394ecce562b3e68';

    
var fkData = ""; // temporary

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.listen(port, ip, function() {
    console.log("kartsaver is up!!");
});

app.get("/", function(req, res) {
    res.render("home");
});

app.post("/compare", function(req, res) {
    var keyword = req.body.searchInp;

    if(!Boolean(keyword)) {
        res.redirect("/");
    }
    var fkUrl = fkApi + '?query=';// + keyword;
    
    request({
        url: fkUrl + keyword,
        headers: {
            'Fk-Affiliate-Id': fkId,
            'Fk-Affiliate-Token': fkToken
        }
    }, function(error, response, body){
        if(!error && response.statusCode == 200) {
            fkData = JSON.parse(body);
            var productList = getFkInfo(JSON.parse(body));
            if(productList.length === 0) {
                var errMsg = 'No products found for "' + keyword + '"';
                res.render("error", {errMsg: errMsg});
            } else {
                res.render("compare", {productList: productList});
            }
        } else {
            res.send(error);
        }
    });
});

app.get("/json", function(req, res) {
    res.send(fkData);
});

app.get("/error", function(req, res) {
    var errMsg = "We're soon there on this!"
    res.render("error", {errMsg: errMsg});
})

function getFkInfo(data) {
    var productList = [];

    data["productInfoList"].forEach(function(product) {
        var productInfo = {
            id: product["productBaseInfoV1"]["productId"],
            title: product["productBaseInfoV1"]["title"],
            image: product["productBaseInfoV1"]["imageUrls"]["200x200"],
            url: product["productBaseInfoV1"]["productUrl"],
            price: product["productBaseInfoV1"]["maximumRetailPrice"],
            specialPrice: product["productBaseInfoV1"]["flipkartSellingPrice"],
            discount: product["productBaseInfoV1"]["discountPercentage"]
        };
        productList.push(productInfo);
    });
    
    return productList;
}

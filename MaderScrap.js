/*
 * Copy and passte this code in your browser 
 * terminal after log in into your mader.pt account
 */
(function() {

    const MAX_PRODUCTOS = 100;
    const CURRENT_LIST_PAGE = 0;
    const CLIENT_ID = '1045';
    const URL_LIST = 'https://mader.pt/controller/products.getList.php';
    const URL_PRODUCT = 'https://mader.pt/controller/product.get.php';
    const CABECERAS_CSV = ['Id', 'Referencia', 'Nombre', 'Imagen', 'Categoría', 'Marca', 'PVR', 'NET', 'Descripción'];
    const IMAGE_BASE = 'https://mader.pt/img/products/thumb/';
    const LANGUAGE_CODE = 'es';
    const USER_TYPE = 'cliente3';
    const METHOD = {
        GET: 'GET',
        POST: 'POST',
    };
    const MODE = {
        CORS: 'cors'
    };
    const VACIO = '';


    let formDataParser = (item) => {

        let form_data = new FormData();
        Object.keys(item)
            .map(key => form_data.append(key, item[key]));

        return form_data;
    }

    let exportToCsv = (fileName, rows) => {

        let processRow = (row) => {

            let finalVal = VACIO;
            for (let j = 0; j < row.length; j++) {
                let innerValue = row[j] === null ? VACIO : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                let result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"'.concat(result, '"');
                if (j > 0)
                    finalVal = finalVal.concat(';');
                finalVal = finalVal.concat(result);
            }

            return finalVal.concat('\n');
        };

        let csvFile = VACIO;
        for (let i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        let link = document.createElement('a');
        let uri = 'data:text/csv;charset=utf-8,'.concat(escape(csvFile));
        link.href = uri;
        link.style = "visibility:hidden";
        link.download = fileName.concat(".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } // FIN exportToCsv


    let init = () => {

	    let getProductList = () => {

	        let bodyData = formDataParser({
	            languageCode: LANGUAGE_CODE,
	            clientID: VACIO,
	            currentListPage: CURRENT_LIST_PAGE,
	            itemsPerPage: MAX_PRODUCTOS,
	            userType: USER_TYPE,
	        });
	        const fetchProductList = {
	            method: METHOD.POST,
	            body: bodyData,
	            mode: MODE.CORS,
	            headers: new Headers(),
	        };

	        fetch(URL_LIST, fetchProductList)
	            .then(response => response.json())
	            .then(json => {
	                let fetches = [];

	                console.log('Listado de productos:', json);
	                json.productsList.map(producto => fetches.push(getProductInfo(producto.id)));

	                Promise.all(fetches)
	                    .then(() => {
	                        console.log("Recopilación de datos terminada, generando csv", csv);
	                        exportToCsv('ProductosMadera.csv', csv)
	                    });
	            });

	    } // Fin getProductList


	    let getProductInfo = (productId) => {

	        let bodyData = formDataParser({
	            languageCode: LANGUAGE_CODE,
	            itemID: productId,
	            clientID: CLIENT_ID,
	            userType: USER_TYPE,
	        });
	        const fetchValues = {
	            method: METHOD.POST,
	            body: bodyData,
	            mode: MODE.CORS,
	            headers: new Headers(),
	        };

	        console.log('id del producto', productId);
	        return fetch(URL_PRODUCT, fetchValues)
	            .then(response => response.json())
	            .then(json => {
	                console.log('info Producto:', json);
	                let producto = json.product;
	                try {
	                    let csvProduct = buildObjectData(producto);
	                    console.log('info Producto CSV:', csvProduct);
	                    csv.push(csvProduct);
	                } catch (err) {
	                    console.error('Ha ocurrido un error con el item', producto);
	                    console.error('cod error:', err);
	                }
	            });

	    } //Fin getProductInfo


	    let getProductFeatures = (producto) => {

	        let features = {
	            Altura: producto.height,
	            Anchura: producto.width,
	            Longitud: producto.length,
	            'Peso Bruto': producto.grossWeigth,
	            'Peso Neto': producto.netWeigth,
	        };

	        if (producto.featureList) {
	            producto.featureList.map(feature => {
	                features[feature.keyTranslation] = feature.featureValue;
	            });
	        }

	        return features;
	    } //Fin getProductFeatures


	    let buildObjectData = (producto) => {

	        return [
	            producto.id,
	            producto.ref,
	            producto.description,
	            IMAGE_BASE + (producto.imageList[0].urlImage || ""),
	            producto.categoryObject.groupDescription || "",
	            producto.brandObject.description || "",
	            producto.priceTable,
	            producto.priceNet,
	            (features => {
	                let lis = Object.keys(features).map(key => `<li>${key}=${features[key]}<li>`);
	                return '<ul>'.concat(lis, '</ul>');
	            })(getProductFeatures(producto))
	        ];
	    }
	    // Fin buildObjectData

	    // ------------------------ init Start ------------------------ //
	    let productosCsv = [];
	    let csv = new Array();
	    csv.push(CABECERAS_CSV);
   	    getProductList();
	}

    init();

})();

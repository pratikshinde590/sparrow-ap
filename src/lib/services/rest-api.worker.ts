onmessage = (e) => {
  console.log("Hello World 👋", e);
  // .then((response) => {
  //         let end = Date.now();

  //         const byteLength = new TextEncoder().encode(
  //           JSON.stringify(response),
  //         ).length;
  //         let responseSizeKB = byteLength / 1024;
  //         let duration = end - start;

  //         let responseBody = response.data.response;
  //         let responseHeaders = response.data.headers;
  //         let responseStatus = response.data.status;
  //         _apiSendRequest.setResponseContentType(
  //           responseHeaders,
  //           collectionsMethods,
  //         );
  //         collectionsMethods.updateRequestProperty(
  //           false,
  //           RequestProperty.REQUEST_IN_PROGRESS,
  //         );
  //         collectionsMethods.updateRequestProperty(
  //           {
  //             body: responseBody,
  //             headers: JSON.stringify(responseHeaders),
  //             status: responseStatus,
  //             time: duration,
  //             size: responseSizeKB,
  //           },
  //           RequestProperty.RESPONSE,
  //         );
  //         isLoading = false;
  //       })
  //       .catch((error) => {
  //         collectionsMethods.updateRequestProperty(
  //           false,
  //           RequestProperty.REQUEST_IN_PROGRESS,
  //         );
  //         collectionsMethods.updateRequestProperty(
  //           {
  //             body: "",
  //             headers: "",
  //             status: "Not Found",
  //             time: 0,
  //             size: 0,
  //           },
  //           RequestProperty.RESPONSE,
  //         );
  //         isLoading = false;
  //       });
};

export {};

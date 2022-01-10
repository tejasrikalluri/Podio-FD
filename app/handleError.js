function handleError(e) {
    console.log(e)
    if (e.status === 401 || e.status === 403 || e.status === 502) {
        notifyMsg("<span>Invalid Credentials were given.</span>");
    } else if (e.status === 404) {
        notifyMsg("<span>Page not found.</span>");
    } else {
        notifyMsg("<span>Unexpected error occurred, please try after sometime.</span>");
    }
}

function notifyMsg(msg) {
    $("#errorMsg").show().html(msg);
}

function closeModal(client) {
    client.instance.close();
}

function resizeApp(client) {
    let height = $('#requiredLinks').outerHeight(true);
    client.instance.resize({
        height: height + 10
    });
}
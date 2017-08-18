
// get table caption
document.getElementById("pageListCaption").innerHTML = chrome.i18n.getMessage('pageListTableCaption');

const BG: any = chrome.extension.getBackgroundPage();

// get db $sites
const $sites = BG.$db.getCollection('sites');
console.log('sites: ', $sites);


if($sites.data.length > 0){

    $sites.data.forEach(site => {
        console.log('site: ', site);

        // Table row
        let tr = document.createElement("TR");
        // row id
        tr.id = `page_${site.$loki}`;

        //  Data column - site url
        let td_site_url = document.createElement("TD");
        let td_text = document.createTextNode(site.url);
        td_site_url.appendChild(td_text);

        // Data column - site delete action
        let td_del_action = document.createElement("TD");
        let btnDel = document.createElement("BUTTON");
        btnDel.textContent = chrome.i18n.getMessage('btnDelete');
        btnDel.className = 'btnDelete';
        btnDel.onclick = (e) => removeSite(site.$loki);
        td_del_action.appendChild(btnDel);

        // add table data to table row
        tr.appendChild(td_site_url);
        tr.appendChild(td_del_action);

        document.getElementById("pageList").appendChild(tr);
    }) 

       

}else{
    document.getElementById('pageList').innerHTML = chrome.i18n.getMessage('optionsNoSitesMsg');
}




/**
 * Remove site from db
 */
function removeSite(siteId) {
    console.log(`btn from row with id: page_${siteId} asks to be removed..`);

    // remove from db
    $sites.removeWhere({'$loki': siteId});

    // 'remove' from dom
    document.getElementById(`page_${siteId}`).hidden = true;

}

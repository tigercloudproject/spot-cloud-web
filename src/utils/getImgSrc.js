

export function getImgSrc(img,num) {
    //1简体 2繁体 2英文
    if(num===1) {
        return 'CN-'+img;
    }else if(num===2) {
        return 'TW-'+img;
    }else if(num===3){
        return 'EN-'+img;
    }else if(num===4) {
        return 'KO-'+img;
    }else {
        return 'EN-'+img;
    }
}

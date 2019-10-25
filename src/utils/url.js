// 获取主域名名称+端口
// 如果是IP则返回IP
export function getMainDomainName( hostname ) {
    // 设置主域
    // 因为需要加端口，才能在对应cookies中
    let domain = hostname || window.location.hostname
      , rtn = '';

    if ( /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.test( domain ) === false ) {
        ( function ( domain ) {
            rtn = domain[ domain.length - 2 ] + '.' + domain[ domain.length - 1 ];
        } )( domain.split( '.' ) );
    } else {
        rtn = domain;
    }

    return rtn;
}

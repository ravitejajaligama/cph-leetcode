const Name = (url) =>{
    const start = url.indexOf('problems') + 'problems'.length + 1; 
    const end = url.indexOf('description');
    let pName;
    if(url.slice(start, end)[start-end-1]=='/'){
        pName = url.slice(start, end-1);
    }
    else{
        pName = url.slice(start, end);
    }

    return pName;
};

module.exports = {Name}


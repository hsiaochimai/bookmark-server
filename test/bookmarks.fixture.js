function makeBookmarksArray(){
    return [
        
            {
                "id": 1,
                "title": "Test 1",
                "url_link": "https://www.test1.com/",
                "descript": "Test 1",
                "rating": 3
            },
            {
                "id": 2,
                "title": "Test 2",
                "url_link": "http://test2.com",
                "descript": "Test 2",
                "rating": 4
            },
            {
                "id": 3,
                "title": "Test 3",
                "url_link": "http://test3.com/",
                "descript": "Test 3",
                "rating": 5
            }
    ];
}
function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      descript: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      url_link:'https://url.to.file.which/does-not.exist',
      rating: 1

    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      descript: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
  }
module.exports ={
 makeBookmarksArray,  
 makeMaliciousBookmark, 
}
import './main.css'

// To collect headings and then add to the page ToC
function pageToC (headings, path) {
  let toc = ['<div class="page_toc">']
  const list = []
  headings = document.querySelectorAll(`#main ${window.$docsify.toc.target}`)

  if (headings) {
    headings.forEach(function (heading) {
      headingFix(heading);
      const item = generateToC(heading.tagName.replace(/h/gi, ''), heading.innerHTML)
      if (item) {
        list.push(item)
      }
    })
  }
  if (list.length > 0) {
    toc = toc.concat(list)
    toc.push('</div>')
    return toc.join('')
  } else {
    return ''
  }
}

// To generate each ToC item
function generateToC (level, html) {
  if (level >= 1 && level <= window.$docsify.toc.tocMaxLevel) {
    const heading = ['<div class="lv' + level + '">', html, '</div>'].join('')
    return heading
  }
  return ''
}

function headingFix(heading) {
  let id = heading.id;
  if (!id) {
    id = '_Tocfix' + hashstr(heading.innerHTML);
    heading.id = id;
  }   
  let html = heading.innerHTML;
  if (html.lastIndexOf('>') != html.length - 1) {
    let head = html.substring(0, html.lastIndexOf('>') + 1);
    let text = html.substring(html.lastIndexOf('>') + 1, html.length);
    //heading.innerHTML = head + '<a href="#' + id + '"><span>' + text + '</span></a>';
    heading.innerHTML = head + '<a href="javascript:document.getElementById(\'' + id + '\').scrollIntoView()"><span>' + text + '</span></a>';
    
  }
}

function hashstr(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// scroll listener
const scrollHandler = () => {
  const clientHeight = window.innerHeight
  const titleBlocks = document.querySelectorAll(`#main ${window.$docsify.toc.target}`)
  let insightBlocks = []
  titleBlocks.forEach((titleBlock, index) => {
    const rect = titleBlock.getBoundingClientRect()
    // still in sight
    if (rect.top <= clientHeight && rect.height + rect.top > 0) {
      insightBlocks.push(index)
    }
  })
  const scrollingElement = document.scrollingElement || document.body
  // scroll to top, choose the first one
  if (scrollingElement.scrollTop === 0) {
    insightBlocks = [0]
  } else if (scrollingElement.offsetHeight - window.innerHeight - scrollingElement.scrollTop < 5 &&
    insightBlocks.length > 0) {
    // scroll to bottom and still multi title in sight, choose the first one
    insightBlocks = [insightBlocks[0]]
  }
  if (insightBlocks.length) {
    const tocList = document.querySelectorAll('.page_toc>div')
    tocList.forEach((t, index) => {
      if (index === insightBlocks[0]) {
        t.classList.add('active')
      } else {
        t.classList.remove('active')
      }
    })
  }
}

const makeToc = () => {
  const nav = window.Docsify.dom.find('.toc-nav')
  if (nav) {
    nav.innerHTML = pageToC().trim()
    if (nav.innerHTML === '') {
      window.Docsify.dom.toggleClass(nav, 'add', 'nothing')
      window.document.removeEventListener('scroll', scrollHandler)
    } else {
      window.Docsify.dom.toggleClass(nav, 'remove', 'nothing')
      scrollHandler()
      window.document.addEventListener('scroll', scrollHandler)
    }
  }  
}

export function install (hook, vm) {
  hook.mounted(function () {
    const content = window.Docsify.dom.find('.content')
    if (content) {
      const nav = window.Docsify.dom.create('aside', '')
      window.Docsify.dom.toggleClass(nav, 'add', 'toc-nav')
      window.Docsify.dom.before(content, nav)
    }
    window.document.addEventListener('reloadtoc', makeToc)
  })
  hook.doneEach(function () {
    makeToc();
  })
}

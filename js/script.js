((() => {
  const note = document.querySelector('.note')
  const image = document.querySelector('.image')

  const colorPicker = document.querySelector('input[type="color"]')
  const colorIcon = document.querySelector('.change-background')
  const filePicker = document.querySelector('input[type="file"]')
  const fileIcon = document.querySelector('.add-image')
  const noteIcon = document.querySelector('.add-note')

  const bgColor = JSON.parse(window.localStorage.getItem('bgcolor'))
  const notesJson = JSON.parse(window.localStorage.getItem('notes')) || []
  let imagesJson = JSON.parse(window.localStorage.getItem('images')) || []

  if (bgColor === null) {
    const firstNote = 'Welcome to your new less boring new tab!<br>' +
            '<small>(&#x2B06; double-click on the top bar to delete this note )</small>'
    newNote(firstNote)
    updateData('bgcolor', colorPicker.value)
  } else {
    colorPicker.value = bgColor
    if (notesJson.length > 0) {
      const numberOfNotes = notesJson.length
      generateNotes(numberOfNotes)
    }
    if (imagesJson.length > 0) {
      const numberOfImages = imagesJson.length
      generateImages(numberOfImages)
    }
  }
  document.body.style.backgroundColor = colorPicker.value

  function getDate () {
    const dateElement = document.querySelector('h1.date')
    dateElement.innerText = new Date().toDateString()
  }

  function newNote (texto) {
    note.getElementsByTagName('P')[0].innerHTML = texto
    const clon = note.cloneNode(true)
    const id = newId(notesJson)
    const top = (window.innerHeight - note.offsetHeight) / 2
    const left = (window.innerWidth - note.offsetWidth) / 2

    notesJson.push({
      id: id,
      text: texto,
      top: top,
      left: left
    })
    updateData('notes', notesJson)

    clon.getElementsByTagName('P')[0].innerHTML = texto
    clon.dataset.id = id
    clon.style.top = `${top}px`
    clon.style.left = `${left}px`
    clon.style.visibility = 'visible'
    new window.Draggabilly(clon, {
      containment: 'body',
      handle: '.note-header'
    }).on('dragEnd', noteDragEnd)
    document.body.appendChild(clon)
  }

  function generateNotes (number) {
    for (let i = 0; i < number; i++) {
      const clon = note.cloneNode(true)
      const text = notesJson[i].text
      clon.getElementsByTagName('P')[0].innerHTML = text
      clon.dataset.id = notesJson[i].id
      clon.style.top = `${notesJson[i].top}px`
      clon.style.left = `${notesJson[i].left}px`
      clon.style.visibility = 'visible'
      new window.Draggabilly(clon, {
        containment: 'body',
        handle: '.note-header'
      }).on('dragEnd', noteDragEnd)
      document.body.appendChild(clon)
    }
  }

  function noteDragEnd () {
    const id = parseInt(this.element.dataset.id)
    notesJson.find(obj => {
      if (obj.id === id) {
        obj.top = this.position.y
        obj.left = this.position.x
      }
    })
    updateData('notes', notesJson)
  }

  function saveNoteContent (element) {
    const noteId = parseInt(element.parentElement.dataset.id)
    const noteText = element.innerHTML
    notesJson.find(obj => {
      if (obj.id === noteId) {
        obj.text = noteText
      }
    })
    updateData('notes', notesJson)
  }

  function newImage (event) {
    const clon = image.cloneNode(true)
    const id = newId(imagesJson)
    const file = event.target.files
    const img = clon.getElementsByTagName('IMG')[0]
    img.file = file
    const reader = new window.FileReader()
    reader.readAsDataURL(file[0])
    reader.onload = ((i => e => {
      i.src = e.target.result
    }))(img)
    img.onload = () => {
      const top = (window.innerHeight - img.height) / 2
      const left = (window.innerWidth - img.width) / 2
      clon.style.top = `${top}px`
      clon.style.left = `${left}px`
      imagesJson.push({
        id: id,
        img: reader.result,
        top: top,
        left: left
      })
      if (updateData('images', imagesJson)) {
        new window.Draggabilly(clon, {
          containment: 'body',
          handle: '.image-header'
        }).on('dragEnd', imageDragEnd)
        clon.dataset.id = id
        clon.style.visibility = 'visible'
        document.body.appendChild(clon)
      } else {
        imagesJson = JSON.parse(window.localStorage.getItem('images')) || []
      }
    }
  }

  function generateImages (number) {
    for (let i = 0; i < number; i++) {
      const clon = image.cloneNode(true)
      clon.dataset.id = imagesJson[i].id
      clon.style.top = `${imagesJson[i].top}px`
      clon.style.left = `${imagesJson[i].left}px`
      clon.getElementsByTagName('IMG')[0].src = imagesJson[i].img
      clon.style.visibility = 'visible'
      new window.Draggabilly(clon, {
        containment: 'body',
        handle: '.image-header'
      }).on('dragEnd', imageDragEnd)
      document.body.appendChild(clon)
    }
  }

  function imageDragEnd () {
    const id = parseInt(this.element.dataset.id)
    imagesJson.find(obj => {
      if (obj.id === id) {
        obj.top = this.position.y
        obj.left = this.position.x
      }
    })
    updateData('images', imagesJson)
  }

  function updateData (key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      newNote('The file is too big :(')
      return false
    }
  }

  function newId (json) {
    let flag = true
    let newId = 0
    while (flag) {
      flag = false
      for (let j = 0; j < json.length; j++) {
        if (json[j].id === newId) {
          flag = true
          newId++
        }
      }
    }
    return newId
  }

  function deleteItem (element, key, value) {
    const item = element.parentElement
    const id = parseInt(item.dataset.id)
    value.forEach((result, index) => {
      if (result.id === id) {
        value.splice(index, 1)
      }
    })
    updateData(key, value)
    item.remove()
  }

  function eventListeners () {
    noteIcon.addEventListener('click', () => {
      newNote('')
    })

    document.body.addEventListener('input', event => {
      if (event.target.nodeName === 'P') {
        saveNoteContent(event.target)
      }
    })

    filePicker.addEventListener('change', newImage)
    fileIcon.addEventListener('click', () => {
      filePicker.click()
    })

    document.body.addEventListener('dblclick', event => {
      if (event.target.className === 'note-header') {
        deleteItem(event.target, 'notes', notesJson)
      } else if (event.target.className === 'image-header') {
        deleteItem(event.target, 'images', imagesJson)
      }
    })

    colorPicker.addEventListener('input', () => {
      document.body.style.backgroundColor = colorPicker.value
      updateData('bgcolor', colorPicker.value)
    })
    colorIcon.addEventListener('click', () => {
      colorPicker.click()
    })
  }

  getDate()
  eventListeners()
})())

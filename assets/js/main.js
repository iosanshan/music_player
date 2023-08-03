
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio =  $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volume = $('#volume')
const timeCurrent = $('.time-current')
const timeTotal = $('.time-total')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Anata no Koibito ni Naritai',
            singer: 'ChoQMay',
            path: './assets/music/Anata no Koibito ni Naritai - ChoQMay.mp3',
            image: './assets/img/Anata no Koibito ni Naritai - ChoQMay.jpg',
        },
        {
            name: 'The Flame of Love',
            singer: 'Rokudenashi',
            path: './assets/music/The Flame of Love - Rokudenashi.mp3',
            image: './assets/img/The Flame of Love - Rokudenashi.jpg',
        },
        {
            name: 'Deichuu ni Saku',
            singer: 'Wolpis Kater',
            path: './assets/music/Deichuu ni Saku - Wolpis Kater.mp3',
            image: './assets/img/Deichuu ni Saku - Wolpis Kater.jpg',
        },
        {
            name: 'Shoujo Rei',
            singer: 'MORE MORE JUMP x Hatsune Miku',
            path: './assets/music/Shoujo Rei - MORE MORE JUMP! x Hatsune Miku.mp3',
            image: './assets/img/Shoujo Rei - MORE MORE JUMP! x Hatsune Miku.jpg',
        },
        {
            name: 'Uchiage Hanabi',
            singer: 'DAOKO',
            path: './assets/music/Uchiage Hanabi - DAOKO.mp3',
            image: './assets/img/Uchiage Hanabi - DAOKO.jpg',
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        playlist.innerHTML = htmls.join('')
    },

    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], 
        {
            duration: 10000, // Thoi gian quay: 10s
            iterations: Infinity,
        })
        cdThumbAnimate.pause()

        // Xủ lý phóng to, thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCDWidth = cdWidth - scrollTop

            if (newCDWidth > 0) {
                cd.style.width = newCDWidth + 'px'
            } else {
                cd.style.width = 0 + 'px'
            }

            cd.style.opacity = newCDWidth / cdWidth
        }

        // Xử lý click Play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi nhạc được chạy
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            
        }

        // Khi nhạc bị dừng lại
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            // Cập nhật tiến độ bài hát trên thanh Progress
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }

            // Cập nhật thời gian bài hát
            const currentTime = timeFormat(audio.currentTime)
            const totalTime = timeFormat(audio.duration)
            timeCurrent.innerText = currentTime
            if (totalTime != 'NaN:NaN') {
                timeTotal.innerText = totalTime
            } 
            
            // Tính toán thời gian của bài hát thành dạng 'phút:giây'
            function timeFormat(seconds) {
                let minute = Math.floor(seconds / 60);
                let second = Math.floor(seconds % 60);
                minute = minute < 10 ? "0" + minute : minute;
                second = second < 10 ? "0" + second : second;
                return minute + ":" + second;
            }
        }

        // Tua bài hát
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Tắt âm khi tua bài hát trên PC
        progress.onmousedown = function() {
            audio.pause()
        }
        progress.onmouseup = function() {
            audio.play()
        }
        // Tắt âm khi tua trên Mobile phone
        progress.ontouchstart = function() {
            audio.pause()
        }
        progress.ontouchend = function() {
            audio.play()
        }

        // Chuyển bài hát
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            // _this.activeSong()
            audio.play()
            cdThumbAnimate.cancel()
        }
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            // _this.activeSong()
            audio.play()
            cdThumbAnimate.cancel()
        }

        // Phát ngẫu nghiên
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Phát lặp lại
        repeatBtn.onclick = function() {
            _this.isRepeat =!_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Tự động chuyển bài
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào Playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.activeSong()
                    audio.play()
                }

                if (e.target.closest('.option')) {
                    alert('This button do nothing! Please dont click it 🥹')
                }
            }
        }

        // Điều chỉnh volume
        volume.oninput = function(e) {
            audio.volume = e.target.value
        }

        //
    },

    // Thêm trạng thái Active cho bài hát đang chạy
    activeSong: function() {
        $('.song.active').classList.remove('active')
        const songList = $$('.song')
        const song = songList[this.currentIndex]
        song.classList.add('active')
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'end',
                inline: 'center'
            })
        }, 300)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    timeUpdate: function() {
        
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        
        
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
        this.activeSong()
        this.scrollToActiveSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
        this.activeSong()
        this.scrollToActiveSong()
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
        this.activeSong()
        this.scrollToActiveSong()
    },

    start: function() {
        // Gán cấu hình từ config vào app
        this.loadConfig()

        // Định nghĩa các thuộc tính trong Object
        this.defineProperties()

        // Lắng nghe, xử lý các sự kiện của DOM Events
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy app
        this.loadCurrentSong()

        // Cập nhật thời gian
        this.timeUpdate()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của nút repeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
}

app.start()
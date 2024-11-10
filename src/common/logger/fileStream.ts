
import { dirname } from 'path'
import { createWriteStream, stat, rename } from 'fs'

const assert = require("assert")  // 断言表达式
const mkdirp = require("mkdirp")  // 创建文件夹

import { LogStream } from "./logStream"

const defaultOptions = {
  maxBufferLength: 4096, // 日志写入缓存队列最大长度
  flushInterval: 1000, // flush间隔
  logRotator: {
    byHour: true,
    byDay: false,
    hourDelimiter: '_'
  }
}

const onError = (err) => {
  console.error(
    '%s ERROR %s [chair-logger:buffer_write_stream] %s: %s\n%s',  // 某种 error log 格式化?
    new Date().toString(),
    process.pid,  // 进程ID号
    err.name,
    err.message,
    err.stack
  )
}

const fileExists = async (srcPath) => {
  return new Promise((resolve, reject) => {
    // fs.stat方法 用于异步地获取文件或文件夹的状态信息。
    // 该方法接收两个参数：要获取状态的文件或文件夹的路径，以及一个回调函数。
    // 回调函数包含两个参数：一个错误对象（如果在获取状态过程中发生错误）和一个fs.Stats对象，后者包含了文件或文件夹的详尽信息。
    stat(srcPath, (err, stats) => {
      // isFile()：如果文件是一个普通文件，则返回true。
      // isDirectory()：如果文件是一个目录，则返回true。
      if (!err && stats.isFile()) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
  })
}

const fileRename = async (oldPath, newPath) => {
  return new Promise((resolve, reject) => {
    // fs.rename方法既可以用于重命名和移动文件，也可以用于重命名和移动文件夹。
    rename(oldPath, newPath, (e) => {
      resolve(e ? false : true);
    })
  })
}

export class FileStream extends LogStream {
  private options: any = {};
  private _stream = null;
  private _timer = null;
  private _bufSize = 0;
  private _buf = [];
  private lastPlusName = '';
  private _RotateTimer = null;

  constructor(options) {
    super(options)

    /**
     * assert 断言表达式，它用于确保options.fileName是一个真值（即非空、非null、非undefined等）
     * 如果options.fileName不满足条件，则会抛出一个AssertionError
     * 并附带错误信息'should pass options.fileName'。
     */
    assert(options.fileName, 'should pass options.fileName')

    this.options = Object.assign({}, defaultOptions, options)
    this._stream = null
    this._timer = null
    this._bufSize = 0
    this._buf = []
    this.lastPlusName = this._getPlusName();  // 根据日志分割时间配置和当前时间，生成对应的文件夹后缀
    this.reload()
    this._RotateTimer = this._createRotateInterval();
  }

  // 这个方法啥时候谁调用的???
  // super 继承调用的 logStream this.log()
  // super 调用父类的构造函数时，同名函数，先执行 父类的，再执行子类的
  // 这里 logStream.log 和 FileStream.log 都执行了
  log(data) {
    data = this.format(this.jsonParse(data))
    if (data) this._write(data + '\n')
  }

  /**
   * 重新载入日志文件
   */
  reload() {
    // 关闭原来的 stream
    this.close()
    // 新创建一个 stream
    this._stream = this._createStream()
    this._timer = this._createInterval()
  }

  reloadStream() {
    this._closeStream()
    this._stream = this._createStream()
  }
  /**
   * 关闭 stream
   */
  close() {
    this._closeInterval() // 关闭定时器
    if (this._buf && this._buf.length > 0) {
      // 写入剩余内容
      this.flush()
    }
    this._closeStream() //关闭流
  }

  /**
   * @deprecated
   */
  end() {
    console.log('transport.end() is deprecated, use transport.close()')
    this.close()
  }

  /**
   * 覆盖父类，写入内存
   * @param {Buffer} buf - 日志内容
   * @private
   */
  _write(buf) {
    this._bufSize += buf.length
    this._buf.push(buf)
    if (this._buf.length > this.options.maxBufferLength) {
      this.flush()
    }
  }

  /**
   * 创建一个 stream
   * @return {Stream} 返回一个 writeStream
   * @private
   */
  _createStream() {
    // this.options.fileName => D:\frontend\code\gateway\logs\fast-gateway.log
    // dirname(this.options.fileName) => D:\frontend\code\gateway\logs

    // @Function dirname 
    // Return the directory name of a path !注意，只到文件夹层级 directory!!

    // mkdirp 递归创建文件夹
    mkdirp.sync(dirname(this.options.fileName)) // D:\frontend\code\gateway\logs

    // 创建一个要写入的文件流
    // e.g. let ws = fs.createWriteStream('./2.txt');

    // fs.WriteStream 用于将数据写入文件系统
    // 与传统的文件写入方法（如fs.writeFileSync）相比，使用 fs.WriteStream 可以以非阻塞的方式写入文件
    // 这对于处理大量数据或需要高性能I/O操作的场景尤为重要。
    const stream = createWriteStream(this.options.fileName, { flags: 'a' })
    stream.on('error', onError)
    return stream
  }

  /**
   * 关闭 stream
   * @private
   */
  _closeStream() {
    if (this._stream) {
      this._stream.end()
      this._stream.removeListener('error', onError)
      this._stream = null
    }
  }

  /**
   * 将内存中的字符写入文件中
   */
  flush() {
    if (this._buf.length > 0) {
      this._stream.write(this._buf.join(''))
      this._buf = []
      this._bufSize = 0
    }
  }

  /**
   * 创建定时器，一定时间内写入文件
   * @return {Interval} 定时器
   * @private
   */
  _createInterval() {
    return setInterval(() => {
      this.flush()
    }, this.options.flushInterval)
  }

  /**
   * 关闭定时器
   * @private
   */
  _closeInterval() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  }

  /**
   * 分割定时器
   * @private
   */
  _createRotateInterval() {
    return setInterval(() => {
      this._checkRotate()
    }, 1000)
  }

  /**
   * 检测日志分割
   */
  _checkRotate() {
    let flag = false

    // 根据日志分割时间配置和当前时间，生成对应的文件夹后缀
    // e.g.  .2024-11-6_20
    const plusName = this._getPlusName()  

    // 如果还是当前设置的间隔区间，则不会创建新文件，还是log到原有的文件中
    if (plusName === this.lastPlusName) {
      return
    }
    this.lastPlusName = plusName;

    // 把 xx.log 文件，重命名为 xx.log.2024-11-6_20 ???
    // 相当于始终保持 xx.log 记录的是最新的日志 ?
    this.renameOrDelete(this.options.fileName, this.options.fileName + plusName)
      .then(() => {
        this.reloadStream()
      })
      .catch(e => {
        console.log(e)
        this.reloadStream()
      })
  }

  _getPlusName() {
    let plusName
    const date = new Date()
    if (this.options.logRotator.byHour) {
      plusName = `${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()}${this.options.logRotator.hourDelimiter}${date.getHours()}`
    } else {
      plusName = `${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()}`
    }
    return `.${plusName}`;
  }

  /**
   * 重命名文件
   * @param {*} srcPath 
   * @param {*} targetPath 
   * 
   * 源文件 srcPath 必须存在，而重命名后的 targetPath 必须事先不存在
   */
  async renameOrDelete(srcPath, targetPath) {
    if (srcPath === targetPath) {
      return
    }
    const srcExists = await fileExists(srcPath);
    if (!srcExists) {
      return
    }
    const targetExists = await fileExists(targetPath)

    if (targetExists) {
      console.log(`targetFile ${targetPath} exists!!!`)
      return
    }
    await fileRename(srcPath, targetPath)
  }

}
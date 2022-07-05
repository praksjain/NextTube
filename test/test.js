const NextTube = artifacts.require('./NextTube.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('NextTube', ([deployer, author]) => {
  let nexttube

  before(async () => {
    nexttube = await NextTube.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await nexttube.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await nexttube.name()
      assert.equal(name, 'NextTube')
    })
  })

  describe('videos', async () => {
    let result, videoCount
    const hash = 'ABC'

    before(async () => {
      result = await nexttube.uploadVideo(hash, 'Video title', { from: author })
      videoCount = await nexttube.videoCount()
    })

    //check event
    it('creates videos', async () => {
      // SUCCESS
      assert.equal(videoCount, 1)
      const event = result.logs[0].args
      console.log('12345676wsdfvbhgr', event)
      assert.equal(event.id.toNumber(), videoCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.title, 'Video title', 'title is correct')
      assert.equal(event.author, author, 'author is correct')

      // FAILURE: Video must have hash
      await nexttube.uploadVideo('', 'Video title', { from: author }).should.be.rejected;

      // FAILURE: Video must have title
      await nexttube.uploadVideo('Video hash', '', { from: author }).should.be.rejected;
    })

    //check from Struct
    it('lists videos', async () => {
      const video = await nexttube.videos(videoCount)
      assert.equal(video.id.toNumber(), videoCount.toNumber(), 'id is correct')
      assert.equal(video.hash, hash, 'Hash is correct')
      assert.equal(video.title, 'Video title', 'title is correct')
      assert.equal(video.author, author, 'author is correct')
    })
  })
})
pragma solidity ^0.5.0;

// Steps involed -
// 1. Model the Video --> create struct
// 2. Uplaod the Video
// 3. Store the Video
// 4. List the Video

contract NextTube {
    uint256 public videoCount = 0;
    string public name = "NextTube";
    mapping(uint256 => Video) public videos;

    struct Video {
        uint256 id; // Unique identifier
        string hash; // Video IPFS hash
        string title; // Video title
        address author; // Address who uploads the video
    }

    event VideoUploaded(uint256 id, string hash, string title, address author);

    constructor() public {}

    function uploadVideo(string memory _videoHash, string memory _title)
        public
    {
        // Check for video hash
        require(bytes(_videoHash).length > 0, "Video hash does not exist..!!");

        // Check for video title
        require(bytes(_title).length > 0, "Title does not exist..!!");

        // Check for uploader address
        require(msg.sender != address(0), "Address does not exist..!!");

        // Increment video id
        videoCount += 1;

        // Add video to the contract
        videos[videoCount] = Video(videoCount, _videoHash, _title, msg.sender);

        // Trigger an event
        emit VideoUploaded(videoCount, _videoHash, _title, msg.sender);
    }
}

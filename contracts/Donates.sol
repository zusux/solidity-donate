// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract Donates {
    struct User {
        string name;
        uint create_at; //时间
    }
    mapping (string => address) findAddrByName;
    mapping (address => User) findUserByAddr;
    User[]  users;
    struct Record {
        User user;
        uint amount; //金额
        uint donation_at; //捐款时间
    }
    Record[] records;
    //设置名称
    function setName(string memory _name) public checkNameLen(_name) {
        address owner = findAddrByName[_name];
        emptyAddr(owner);
        User memory user = User(_name,block.timestamp);
        users.push(user);
        findUserByAddr[msg.sender] = user;
        findAddrByName[_name] = msg.sender;
    }
    //限制名称长度必须大于0
    modifier checkNameLen(string memory _name){
        require(bytes(_name).length > 0);
        _;
    }
    //检查是否是空地址
    function emptyAddr(address owner) internal pure{
        require(owner == address(0),"this name is userd");
    }
    //捐款
    function donate() public payable  {
        User memory user = findUserByAddr[msg.sender];
        Record memory  r = Record(user,msg.value,block.timestamp);
        records.push(r) ;
    }
    //获取捐款用户
    function getUsers() public view returns(User[] memory ){
        return users;
    }
    //获取捐款列表
    function donateList() public view returns(Record[] memory){
        return records;
    }
    //获取账户金额
    function getBalance(address addr) public view returns(uint){
        return addr.balance;
    }
    //捐赠金额
    function donateAmount() public view returns(uint){
        return address(this).balance;
    }
}
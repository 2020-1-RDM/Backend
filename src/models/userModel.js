const bcrypt = require('bcrypt');

export default class User {
    constructor(user, cpf, mentorFlag, email, password, name, linkedin, phone) {
        this.user = user;
        this.cpf = cpf;
        this.mentorFlag = mentorFlag;
        this.email = email;
        this.password = password;
        this.name = name;
        this.linkedin = linkedin;
        this.phone = phone;
    }

    getUser() {
        return this.user;
    }

    getCpf(){
        return this.cpf;
    }

    getMentorFlag() {
        return this.mentorFlag;
    }

    getEmail() {
        return this.email;
    }
    
    async getPassword() {
        return await bcrypt.hash(this.password, 8);
    }
    
    getName() {
        return this.name;
    }

    getLinkedin() {
        return this.linkedin;
    }

    getPhone() {
        return this.phone;
    }
}
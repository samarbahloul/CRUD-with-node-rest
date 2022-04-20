require('dotenv').config(); //on ajoutant celle ci on remplace l'url par l'url dans .env
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const userModel = require('./models/users');

const app = express();

app.use(cors());
app.use(bodyparser.json());

//connct database
mongoose.connect(process.env.mongodburl, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('conncetion failed...', err);
    }
    else {
        console.log('db connection success...');
    }
});

//1.save or create data

app.post('/', async (req, res) => {
    console.log(req.body, 'postdata');
    const chkdataexist = await userModel.findOne({ $or: [{ uemail: req.body.email }, { umobile: req.body.mobile }] });
    if (chkdataexist) {
        if (chkdataexist.uemail == req.body.email) {
            res.send({
                msg: "email id already exist"
            });
        }
        else {
            res.send({
                msg: "mobile number already"
            });
        }
    }
    else {
        //save  db
        const data = new userModel(
            {
                uname: req.body.name,
                uemail: req.body.email,
                umobile: req.body.mobile
            }
        );

        data.save((err, result) => {
            if (err) {
                console.log('create db failed', err);
            }
            else {
                res.send({
                    msg: 'data created',
                    data: result
                });
            }
        });
    }
})

//2.read data
app.get('/', async (req, res) => {
    const data = await userModel.find();   //to sort data .find.sort
    if (data) {
        res.send({
            msg: "all user data",
            result: data
        });
    }
    else {
        res.send({
            msg: "No data found "
        })
    }
});

//3.get data by id 
app.get('/:id', async (req, res) => {
    if (req.params.id) {
        const chkid = mongoose.isValidObjectId(req.params.id);
        if (chkid) {
            const iddata = await userModel.findById({ _id: req.params.id });
            if (iddata == null) {
                res.send({
                    msg: "single data not exist",
                    result: iddata
                });
            }
            else {
                res.send({
                    msg: "single data ",
                    result: iddata
                });
            }
        }
        else {
            res.send({
                msg: "invalid user id "
            });
        }

    }



});

//4.delete data
app.delete('/:id', async (req, res) => {
    const chkvalidid = mongoose.isValidObjectId(req.params.id);
    if (chkvalidid == true) {
        const iddata = await userModel.remove({ _id: req.params.id });
        if (iddata == null) {
            res.send({
                msg: "data not found"
            });
        }
        else {
            res.send({
                msg: "data removed"
            });
        }
    }
    else {
        res.send({
            msg: "invalid id"
        });
    }
});

//5.update data
app.put('/:id', async (req, res) => {
    const updatedata = await userModel.updateOne({ _id: req.params.id }, { $set: { uemail: req.body.email } });
    if (updatedata) {
        res.send({
            msg: "data updated"
        });
    }
});






//run server
const PORT = process.env.PORT | 3000;
app.listen(PORT, () => {
    console.log(`server running .... ${PORT}`);
});


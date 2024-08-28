import { upload, uploadArray } from '../utilities/file.utility';
import { Response, Request } from 'express';
import { UserRequest } from 'src/interfaces/user-request.interface';
import { File } from '../entity/File';
import { getConnection } from 'typeorm';

/**
 * @description Upload a file
 * @param {UserRequest} req
 * @param {Response} res
 * @returns file ID
 */
const uploadFile = (req: UserRequest, res: Response) => {
    // TODO: Virus Scanning
    upload(req, res, async err => {
        if (req.fileExtError) {
            return res.status(400).send(req.fileExtError);
        }
        if (err) {
            switch (err.code) {
                case 'LIMIT_FILE_SIZE':
                    return res.status(400).send('Only File size up to 2 MB allowed');
            }
        } else {
            if (!req.file) {
                return res.status(400).send('You must provide a file');
            } else {
                let file = new File();
                file = req.file;
                const newFile = await getConnection().getRepository(File).save(file);
                res.json(newFile.id);
            }
        }
    })
}
/**
 * @description Upload multiple files
 * @param {UserRequest} req
 * @param {Response} res
 * @returns file ID
 */
const uploadFileArray = (req: UserRequest, res: Response) => {
    return new Promise((resolve, reject) => {
        uploadArray(req, res, async err => {
            if (req.fileExtError) {
                return res.status(400).send(req.fileExtError);
            }
            if (err) {
                switch (err.code) {
                    case 'LIMIT_FILE_SIZE':
                        return res.status(400).send('Only File size up to 2 MB allowed');
                }
            } else {
                resolve(req);
            }
        });
    })
}
/**
 * @description Get file by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns a buffer with the file data
 */
const getFileById = async (req: Request, res: Response) => {
    if (!req.params.id) {
        return res.status(400).json('Invalid File UserRequest');
    }
    if (isNaN(+req.params.id)) {
        return res.status(400).json('Invalid File ID');
    }
    const file = await getConnection().getRepository(File).findOne({ where: { id: +req.params.id } });
    if (!file) {
        return res.status(404).json('File not found');
    }
    res.send(file.buffer);
}

module.exports = {
    uploadFile,
    uploadFileArray,
    getFileById
}
import { upload, uploadArray } from '../utilities/file.utility';
import { Response, Request } from 'express';
import { UserRequest } from '../interfaces/user-request.interface';
import { File } from '../entity/File';
import { AppDataSource } from '../data-source';

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
            console.error('File upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send('Only File size up to 5 MB allowed');
            }
            return res.status(400).send('File upload failed');
        }
        
        if (!req.file) {
            return res.status(400).send('You must provide a file');
        }
        
        try {
            const fileRepository = AppDataSource.getRepository(File);
            let file = new File();
            file = req.file;
            const newFile = await fileRepository.save(file);
            return res.json(newFile.id);
        } catch (error) {
            console.error('Error saving file:', error);
            return res.status(500).send('Failed to save file');
        }
    });
};

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
                res.status(400).send(req.fileExtError);
                return reject(req.fileExtError);
            }
            
            if (err) {
                console.error('File upload error:', err);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    res.status(400).send('Only File size up to 5 MB allowed');
                    return reject('File size limit exceeded');
                }
                res.status(400).send('File upload failed');
                return reject('File upload failed');
            }
            
            resolve(req);
        });
    });
};

/**
 * @description Get file by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns a buffer with the file data
 */
const getFileById = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            return res.status(400).json('Invalid File Request');
        }
        
        if (isNaN(+req.params.id)) {
            return res.status(400).json('Invalid File ID');
        }
        
        const fileRepository = AppDataSource.getRepository(File);
        const file = await fileRepository.findOne({
            where: { id: +req.params.id }
        });
        
        if (!file) {
            return res.status(404).json('File not found');
        }
        
        res.send(file.buffer);
    } catch (error) {
        console.error('Error retrieving file:', error);
        return res.status(500).json('An error occurred while retrieving the file');
    }
};

module.exports = {
    uploadFile,
    uploadFileArray,
    getFileById
};
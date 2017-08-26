#! /usr/bin/python3.6

''' Creates a zip file from src folder into a build dir  '''

import os
import zipfile
import glob

APP_NAME = 'Fluctus'
BUILD_DIR = 'build'
FILE_EXT_TO_IGNORE = ('.sketch')

if not(os.path.exists(f'{BUILD_DIR}')):
    print('Creating build directory..\n')
    # create build dir
    os.mkdir(f'./{BUILD_DIR}')
else:
    # clean build folder
    print('cleaning directory.. \n')
    for file in glob.glob(f'{BUILD_DIR}/*'):
        os.unlink(file)

# create zipfile
with zipfile.ZipFile(f'{BUILD_DIR}/{APP_NAME}.zip', 'w', zipfile.ZIP_DEFLATED) as zip:
    # walk down subdirs of src and get the files
    for (path, dirs, files) in os.walk('src'):
        if(len(files) < 1):
            continue
        for file in files:
            file_path = os.path.join(path, file)
            print(f'File found: {file_path}')

            # skip ignored files
            if(file[file.find('.'):] in FILE_EXT_TO_IGNORE):
                print('ignoring file... \n')
                continue

            # name for file in zipfile
            zipped_file_name = file_path[4:]
            print(f'zipping file as: {zipped_file_name} \n')
            # write file to zipfile
            zip.write(file_path, arcname=zipped_file_name)

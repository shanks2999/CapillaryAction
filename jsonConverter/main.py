
def getCurrentDirectoryFiles():
    import os
    arrFiles = [file for file in os.listdir('./') if file.endswith(".txt")]
    return sorted(arrFiles)


def  pushDataToHeap(arrFiles):
    import pandas as pd
    data = []
    count = 1
    for file in arrFiles:
        tsv = pd.read_table("./" + file, delim_whitespace=True, header=None, float_precision='high')
        tsv.columns = ['xPos', 'yPos', 'zPos', 'label', 'xVel', 'yVel', 'zVel']

        for index, row in tsv.iterrows():
            if len(data) == index:
                data.append(dict())
                data[index]['id'] = index
                data[index]['xPos'] = [row['xPos']]
                data[index]['yPos'] = [row['yPos']]
                data[index]['zPos'] = [row['zPos']]
                data[index]['label'] = [row['label']]
                data[index]['xVel'] = [row['xVel']]
                data[index]['yVel'] = [row['yVel']]
                data[index]['zVel'] = [row['zVel']]
            else:
                data[index]['xPos'].append(row['xPos'])
                data[index]['yPos'].append(row['yPos'])
                data[index]['zPos'].append(row['zPos'])
                data[index]['label'].append(row['label'])
                data[index]['xVel'].append(row['xVel'])
                data[index]['yVel'].append(row['yVel'])
                data[index]['zVel'].append(row['zVel'])
        # print("Processed file: " + str(count))
        count += 1
    return data


def checkDataIntegrity(data, size):
    flag = True
    for index in range(len(data)):
        if len(data[index]['xPos']) != size or len(data[index]['yPos']) != size or len(data[index]['zPos']) != size or \
                len(data[index]['label']) != size or len(data[index]['xVel']) != size or len(
            data[index]['yVel']) != size or \
                len(data[index]['zVel']) != size:
            flag = False
            break;
    return flag


def convertToJSON(data):
    import json
    with open('./data.json', 'w') as outfile:
        json.dump(data, outfile)


def main():
    import time
    start = time.time()
    arrFiles = getCurrentDirectoryFiles()

    data = pushDataToHeap(arrFiles)

    flag = checkDataIntegrity(data, len(arrFiles))

    convertToJSON(data)

    if flag:
        print("SUCCESS!!")
        print(str(len(arrFiles)) + " Processed.")
    else:
        print("FAIL!!")
        print("The format of the file passed has errors. The file is still converted but is not accurate.")


    end = time.time()
    print("The conversion took: " + str(end - start))


if __name__ == '__main__':
    main()

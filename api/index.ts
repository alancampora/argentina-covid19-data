import { NowRequest, NowResponse } from '@now/node';

function main(request: NowRequest, response: NowResponse) {
		response.status(200).send({
      v0:{
        daily: 'https://argentina-covid19-data.now.sh/api/v0/daily'
      }
    });
}

export default main;

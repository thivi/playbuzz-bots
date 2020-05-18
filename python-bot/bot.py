import aiohttp
import json
import random
from proxyscrape import create_collector
import asyncio
from time import sleep
from aiohttp_proxy import ProxyConnector
from proxy import proxies
from proxy2 import proxies as proxies2
from proxy3 import proxies as proxies3
from proxy4 import proxies as proxies4
from proxy5 import proxies as proxies5
import random
import sys
collector = create_collector('my-collector', 'http')


def getNewProxy(*args):
    new_proxy = getProxy()
    if(len(args) != 0):
        while (new_proxy == args[0]):
            new_proxy = getProxy()

    return new_proxy


def getProxy():
    toss = random.randint(0, 1)
    if(toss==0):
        proxyObj = collector.get_proxy()
        proxy = f'{proxyObj.type}://{proxyObj.host}:{proxyObj.port}'
        return proxy
    else:
        proxiesCombined = proxies+proxies2+proxies3+proxies4+proxies5
        proxyObj = proxiesCombined[random.randint(0, len(proxiesCombined)-1)]
        proxy = f'http://{proxyObj["ip"]}:{proxyObj["port"]}'
        return proxy


def vote():
    url = "https://voting.playbuzz.com/poll/"

    data = {
        "questionId": "",
        "resultId": "",
        "sectionId": ""
    }

    tasks = []
    loop = asyncio.get_event_loop()

    for x in range(1, 1000):
        tasks.append(loop.create_task(sendVote(url, data)))

    loop.run_forever()


async def sendVote(url, data):
    proxy = getNewProxy()
    connector = ProxyConnector.from_url(proxy)
    async with aiohttp.ClientSession(connector=connector) as session:
        while True:
            try:
                async with session.post(url, data=data, ssl=False, proxy=proxy, timeout=10) as result:
                    results = await result.json()

                    print(f'Choice 1: {results["results"][""]}\n\
                            Choice 2: {results["results"][""]}')
            except Exception as e:
                proxy = getNewProxy(proxy)

vote()

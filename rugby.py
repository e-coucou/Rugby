# -*- coding: utf-8 -*-
"""
    e-coucou 2015
    Rugby
    
"""
import json, requests, argparse, time

def get_data(url):
	requete = s.get(url,proxies=p)
	js = json.loads(requete.content)
	return js
def get_rank(json,date):
    for e in json:
        if CSV:
            print "{3:};{0:d};{1:};{7:};{2:.1f};{4:d};{5:.1f};{6:d}".format(e['pos'],e['team']['name'], e['pts'] , date, e['matches'], e['previousPts'], e['previousPos'], e['team']['abbreviation'])
        else:
            print "{3:11}{0:3d} {1:37}{7:5}{2:5.1f}{4:6d}{5:7.1f}{6:6d}".format(e['pos'],e['team']['name'], e['pts'] , date, e['matches'], e['previousPts'], e['previousPos'], e['team']['abbreviation'])

def get_all_csv(base):
    maj = ''
    for y in range(2003,2016):
        for m in range(1,13):
            d = str(y)+'-'+str(m)+'-6'
            if (d <> maj):
                u = base+d
                j = get_data(u)
                try:
                    maj = j['effective']['label']
                    get_rank(j['entries'],maj.replace('-','/'))
                except:
                    j=j

def get_date(u):
    j = get_data(u)
    try:
        maj = j['effective']['label']
        print 'Date de mise à jour :',maj
        get_rank(j['entries'],maj.replace('-','/'))
    except:
        print 'no data'
    return j

def get_args():
    global p, args
    global DEBUG, OUTSIDE, VERBOSE, CSV
    parser = argparse.ArgumentParser()
    parser = argparse.ArgumentParser(description='Recupere les historiques de classement de l IRB depuis 2003')
    parser.add_argument("-p","--proxy",default='proxy.my-org.local:8080',help="si vous etes derriere un proxy =1")
    parser.add_argument("-s","--source",default='mru',choices=['mru','wru'],help="mru/wru pour men ou wemen")
    parser.add_argument("-d","--debug",default=False,action="store_true", help="=1 en mode DEBUG" )
    parser.add_argument("-D","--Date", default='2999-12-31',help="Date de la demande : aaaa-mm-jj" )
    parser.add_argument("-O","--Outside",default= False , action="store_true" ,help="par defaut NO Proxy")
    parser.add_argument("-c","--csv",default= False , action="store_true" ,help="par defaut mode présentation sinon mode CSV")
    parser.add_argument("-U","--Username",default="eric",help="username")
    parser.add_argument("-P","--Password",default="",help="password")
    parser.add_argument("-v","--verbose",default=False,action="store_true",help="toutes les infos ...")
    parser.add_argument("-V","--Visiteur",default="FRA",help="visiteur")
    parser.add_argument("-L","--Local",default="IRL",help="local")
    parser.add_argument("-S","--Score",default="3-3",help="score sous le format x-y")
    args = parser.parse_args()
    proxy = args.Username+':'+args.Password+'@'+args.proxy
    p={'http': 'http://'+proxy , 'https':'https://'+proxy}
    OUTSIDE = args.Outside
    if not(OUTSIDE):
        p=''
    DEBUG = args.debug
    VERBOSE = args.verbose
    CSV = args.csv
    if VERBOSE :
        #		print auth.username, auth.password
        print '--------------------------------------------------------------------------'
        aff('Arguments ...','')
        aff('Men/Wemen    :',args.source)
        aff('proxy : ',proxy)
    return

def get_info(crit,dict):
    for fiche in dict:
        if (fiche['team']['abbreviation']==crit):
            return fiche
            break

def get_result(l_pts,v_pts,l_score,v_score,wc):
    delta = -min(10,l_pts+3-v_pts)*0.1
    l,v = delta, -delta
    if (l_score > v_score):
        l = l + 1
        v = v - 1
    elif (l_score<v_score):
        l = l - 1
        v = v + 1
    if wc :
        l = 2 * l
        v = 2 * v
    if abs(l_score-v_score)>=15 :
        l = 1.5 * l
        v = 1.5 * v
    return l_pts+l, v_pts+v

"""---------------------------"""
if __name__ == "__main__":
    get_args()
    s = requests.Session()
    t0 = time.time()
    #   u = 'http://cmsapi.pulselive.com/rugby/rankings/mru?language=en&client=pulse'
    u = 'http://cmsapi.pulselive.com/rugby/rankings/'+args.source+'?date=' + args.Date

    j = get_date(u)
    visiteur = get_info(args.Visiteur,j['entries'])
    local =  get_info(args.Local,j['entries'])
    
    score = args.Score.split('-')
    if (local<>None) & (visiteur<>None) :
        print "[{1:3}] - {0:35}- vs-  [{3:3}] - {2:35}".format(local['team']['name'],local['pos'],visiteur['team']['name'],visiteur['pos'])
        print "          {0:5.1f}                      {1:5.1f}".format(local['pts'],visiteur['pts'])
        print "          {0:5d}                       {1:5d}".format(int(score[0]),int(score[1]))
        v,l = get_result(local['pts'],visiteur['pts'],int(score[0]),int(score[1]), True)
        print "          {0:5.1f}                      {1:5.1f}".format(v,l)

#    print 'FRA' in j
"""    for e in j['entries']:
        print e['team']['abbreviation']
"""
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
            print "{3:11}{0:3d} {1:37}{7:5}{2:5.2f}{4:6d}{5:7.2f}{6:6d}".format(e['pos'],e['team']['name'], e['pts'] , date, e['matches'], e['previousPts'], e['previousPos'], e['team']['abbreviation'])

def get_rk(json,ABB):
	for f in json:
		if f['team']['abbreviation'] == ABB : 
			return f
			break
	return 0
			
def get_all_csv(base):
    entete()
    oMaj, maj = '', ''
    for y in range(2003,2016):
        for m in range(1,13):
            for dd in range(1,32,6):
                d = str(y)+'-'+str(m)+'-'+str(dd)
                u = base+d
                j = get_data(u)
                try:
                    maj = j['effective']['label']
                    #print d, maj, '(',oMaj,')'
                    if (maj <> oMaj) :
                        get_rank(j['entries'],maj.replace('-','/'))
                        oMaj = maj
                except:
                    j=j

def get_date(u):
    j = get_data(u)
    try:
        maj = j['effective']['label']
        print 'Date de mise à jour :',maj
        entete()
        get_rank(j['entries'],maj.replace('-','/'))
    except:
        print 'no data'
    return j

def entete():
    if CSV :
        print "Date;Clst;Nom;Abbrev;Pts;Matches;oldPts;oldClst"
    else :
        print "{3:11}{0:3} {1:37}{7:5} {2:5}  {4:6}{5:7}{6:6}".format('Rk','Nom','pts' , 'date', '#M', 'oPts','oRk','ab.')

def get_info(crit,dict):
    for fiche in dict:
        if (fiche['team']['abbreviation']==crit):
            return fiche
            break

def get_result(l_pts,v_pts,l_score,v_score,wc):
    delta = -min(10,l_pts+3*(2-wc)-v_pts)*0.1
    l,v = delta, -delta
    if (l_score > v_score):
        l = l + 1
        v = v - 1
    elif (l_score<v_score):
        l = l - 1
        v = v + 1
    if abs(l_score-v_score)>15 :
        l = 1.5 * l
        v = 1.5 * v
    return l_pts+l*wc, v_pts+v*wc
def get_match(url):
    match = str(raw_input("Choisir le numero du match [14232]: ")) or '14232'
    u = url+match+'/summary?language=en&client=pulse'
    j = get_data(u)
    """
    for e in j:
        print e
    for e in j['teams'][0] :
        print '- ',e
        for i in j['teams'][0][e]:
            print '      ',j['teams'][0][e][i]
    """
    i=0
    print j['teams'][0]['teamList']['captainId']
    for e in j['teams'][0]['teamList']['list']:
        print '   ',e['player']['id'],e['player']['name']['display'],e['number'],e['positionLabel']#j['teams'][0]['teamList']['list'][i]['player']['name']['display']
        i = i+1
    print '-------------------------------------------'
    return

def get_event(url):
    startDate = str(raw_input('Date de debut [2015-01-01] :')) or '2015-01-01'
    endDate=str(raw_input('Date de fin [2015-12-31] :')) or '2015-12-31'
    pageSize='100'
    page=0
    i=0
    nbPage=9
    while page < nbPage :
        u = url + '?startDate='+startDate+'&endDate='+endDate+'&pageSize='+pageSize+'&page='+str(page)
        page = page+1
        j = get_data(u)
        nbPage = int(j['pageInfo']['numPages'])
        for e in j['content']:
            if (e['sport'] == args.source) & (args.filtre in e['label']) :
                print "{0:5d} - {1:60}  ({2:} / {3:})".format(int(e['id']),e['label'].encode('windows-1252'),e['start']['label'],e['end']['label'])
    print
    event = str(raw_input("Choisir le numero de l'evenement [1238]: ")) or '1238'
    u = url+'/'+event+'/schedule?language=en&client=pulse'+'&status=C'
    j = get_data(u)
    print '-------------------------------------------'
    print "{0:} du {1:} au {2:}\n-".format(j['event']['label'], j['event']['start']['label'], j['event']['end']['label'])
    for e in j['matches']:
		t = time.gmtime(e['time']['millis']/1000+7200)
		d= time.strftime('%Y-%m-%d', t)
		u_rk = 'http://cmsapi.pulselive.com/rugby/rankings/'+args.source+'?date='+d
		j_rk = get_data(u_rk)
		f0 = get_rk(j_rk['entries'],e['teams'][0]['abbreviation'])
		f1 = get_rk(j_rk['entries'],e['teams'][1]['abbreviation'])
		s0,s1=0,0
		p0,p1 = 0,0
		if f0 : 
			p0=f0['pts']
		if f1 : 
			p1=f1['pts']
		if e['status']== 'C' :
			s0,s1 = get_result(p0,p1,e['scores'][0],e['scores'][1],j['event']['rankingsWeight'])
		print "{13:5} {2:2}{0:13} {3:3} -{4:3} {1:13}{7:14} {5:} {8:5} -> ({11:4.1f}-{12:4.1f}) {6:}".format(e['teams'][0]['name'],e['teams'][1]['name'],e['status'],e['scores'][0],e['scores'][1], time.strftime('%d/%m %H:%M', t),e['venue']['name'].encode('windows-1252'),e['eventPhase'],e['attendance'],p0,p1,s0,s1,e['matchId'])
    print '-------------------------------------------'
    return

	
def get_args():
    global p, args
    global DEBUG, OUTSIDE, VERBOSE, CSV
    parser = argparse.ArgumentParser()
    parser = argparse.ArgumentParser(description='Recupere les historiques de classement de l IRB depuis 2003')
    parser.add_argument("-p","--proxy",default='proxy.my-org.local:8080',help="si vous etes derriere un proxy =1")
    parser.add_argument("-s","--source",default='mru',choices=['mru','wru'],help="mru/wru pour men ou wemen")
    parser.add_argument("-m","--mode",default='maj',choices=['maj','score','all','date', 'event'],help="maj : le classement actuel, score : evaluer un classement, all : tous les classements, date : classement à une date option -D")
    parser.add_argument("-d","--debug",default=False,action="store_true", help="=1 en mode DEBUG" )
    parser.add_argument("-D","--Date", default='9999-12-31',help="Date de la demande : aaaa-mm-jj" )
    parser.add_argument("-O","--Outside",default= False , action="store_true" ,help="par defaut NO Proxy")
    parser.add_argument("-c","--csv",default= False , action="store_true" ,help="par defaut mode présentation sinon mode CSV")
    parser.add_argument("-U","--Username",default="eric",help="username")
    parser.add_argument("-P","--Password",default="",help="password")
    parser.add_argument("-v","--verbose",default=False,action="store_true",help="mode verbeux ...")
    parser.add_argument("-V","--Visiteur",default="WAL",help="visiteur")
    parser.add_argument("-L","--Local",default="ENG",help="local")
    parser.add_argument("-S","--Score",default="19-16",help="score sous le format x-y")
    parser.add_argument("-i","--input",help="fichier de résultats en json visiteur/local et abbrev et score")
    parser.add_argument("-f","--filtre",default=' ',help="filtre pour les events : starting with ")
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

"""-----------------------------------------------------------------------------------------------------------------------------"""
if __name__ == "__main__":
    get_args()
    s = requests.Session()
    t0 = time.time()
    #   u = 'http://cmsapi.pulselive.com/rugby/rankings/mru?language=en&client=pulse'
    u = 'http://cmsapi.pulselive.com/rugby/rankings/'+args.source+'?date='
    uu = 'http://cmsapi.pulselive.com/rugby/match?endDate=2015-10-13&startDate=2015-07-12&sort=desc&states=C&pageSize=10&client=pulse'
    uv = 'http://cmsapi.pulselive.com/rugby/match?startDate=2015-10-12&endDate=2016-01-12&states=U,L&pageSize=10&client=pulse'

    mode = args.mode.lower()
    if args.input <> None : mode = 'input'
    if mode == 'date' :
        u = u +  args.Date
        j = get_date(u)
    elif mode == 'maj' :
        u = u +  '9999-12-31'
        j = get_date(u)
    elif mode == 'score' :
        u = u +  args.Date
        j = get_date(u)
        visiteur = get_info(args.Visiteur,j['entries'])
        local =  get_info(args.Local,j['entries'])
    
        score = args.Score.split('-')
        if (local<>None) & (visiteur<>None) :
            print "[{1:3}] - {0:35}[{3:3}] - {2:35}".format(local['team']['name'],local['pos'],visiteur['team']['name'],visiteur['pos'])
            print "       {0:5.1f}                                      {1:5.1f}".format(local['pts'],visiteur['pts'])
            print "    ({0:5d})                                    ({1:5d})".format(int(score[0]),int(score[1]))
            v,l = get_result(local['pts'],visiteur['pts'],int(score[0]),int(score[1]), 2)
            print "       {0:5.2f}                                      {1:5.2f}".format(v,l)
    elif mode == 'all' :
        get_all_csv(u)
    elif mode == 'input' :
        print args.input
    elif mode == 'event' :
        #get_event('http://cmsapi.pulselive.com/rugby/event')
        get_match('http://cmsapi.pulselive.com/rugby/match/')
    print "\nby e-Coucou 2015"
"""    for e in j['entries']:
        print e['team']['abbreviation']
		http://cmsapi.pulselive.com/rugby/match/14232/timeline?language=en&client=pulse  timeline info
		http://cmsapi.pulselive.com/rugby/match/14232/stats?language=en&client=pulse stat info
		http://cmsapi.pulselive.com/rugby/match/14232/summary?language=en&client=pulse info
"""
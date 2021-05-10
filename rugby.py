# -*- coding: utf-8 -*-
"""
    e-coucou 2015
    Rugby

    update rank in 2021
    
"""
import json, requests, argparse, time

menu = { 1:"Matchs" , 2:"Evenements" , 3:"Classement" ,4:"Duels", 5:"MAJ WRC2105", 6:"rank json",7:"rank json init", 8:"Exit" }
DEBUG = 0

def get_data(url):
    requete = s.get(url)
#    requete = s.get(url,proxies=p)
#    print requete.content
    code = requete.status_code
    while code<>200:
        print url
        print requete.status_code
        requete = s.get(url,proxies=p)
        code = requete.status_code
        time.sleep(10)
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
    for y in range(2003,2021):
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
def get_rank_json_init():
    global name,oMaj,maj,js
    oMaj,maj = '',''
    js = []
    name = {}

def get_rank_json(base,begin,end):
    global name,oMaj,maj,js
    for y in range(begin,end): #2016 to update
        print y
        for m in range(1,13,1): #1,13
            print str(m)+'/'+str(y)
            for dd in range(1,32,6):
                d = str(y)+'-'+str(m)+'-'+str(dd)
                yy = y + ((m-1)*30.4+dd)/365.0
                u = base+d
                j = get_data(u)
                try:
                    maj = j['effective']['label']
                    if (maj <> oMaj) :
                        for e in j['entries']:
                            try :
                                name[str(e['team']['id'])]['points'].append([yy,e['pts']])
                                name[str(e['team']['id'])]['rank'].append([yy,e['pos']])
                                name[str(e['team']['id'])]['matchs'].append([yy,e['matches']])
                            except :
                                name[str(e['team']['id'])] = {}
                                name[str(e['team']['id'])]['name'] = str(e['team']['name'])
                                name[str(e['team']['id'])]['id'] = e['team']['id']
                                name[str(e['team']['id'])]['points'] = []
                                name[str(e['team']['id'])]['rank'] = []
                                name[str(e['team']['id'])]['matchs'] = []
                        oMaj = maj
                except:
                    j=j
        print "delai ..."
#        time.sleep(2)
    f = open(r"html/data/ranking.json",'w')
    for n in name :
        js.append(name[n])
    json.dump(js,f)
    f.close()
    return
                    
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

# Recupere les information sur les duels
def get_duel(t1,t2,startDate,endDate):
    url ='https://cmsapi.pulselive.com/rugby/match'
    pageSize='100'
    page=0
    i=0
    nbPage=99
    t={}
    t[t1]={'v':0,'d':0,'n':0,'p':0,'c':0}
    t[t2]={'v':0,'d':0,'n':0,'p':0,'c':0}
    print "Liste des matchs entre "+t1+" - "+t2
    if CSV :
        fo=open("duel.csv",'w')
        fo.write("Id;Local;Pts1;Pts2;Visiteur;Date;Stade;Cpt\n")
    while page < nbPage :
        u = url + '?startDate='+startDate+'&endDate='+endDate+'&pageSize='+pageSize+'&page='+str(page)
        #print u
        page = page+1
        j = get_data(u)
        nbPage = int(j['pageInfo']['numPages'])
        for e in j['content']:
            #print e['teams']
            try :
                l1=e['teams'][0]['abbreviation']
            except : l1=' '
            try :
                l2=e['teams'][1]['abbreviation']
            except : l2=' '
            #print l1,l2,'
            if (((l1 == t1) & (l2 == t2)) | ((l2 == t1) & (l1 == t2))) :
                try :
                    if e['events'][0]['sport']=='mru' :
                        if CSV :
                            fo.write("{0:};{5:};{1:};{2:};{3:};{4:};{6:};{7:}\n".format(int(e['matchId']),e['teams'][0]['name'],int(e['scores'][0]),int(e['scores'][1]),e['teams'][1]['name'],e['events'][0]['start']['label'],e['events'][0]['label'],i+1))
                        print "{0:5d} {5} -> {1:15} {2:3d}  -  {3:3d} {4:15} {6:50} ({7:})".format(int(e['matchId']),e['teams'][0]['name'],int(e['scores'][0]),int(e['scores'][1]),e['teams'][1]['name'],e['events'][0]['start']['label'],e['events'][0]['label'],i+1)
                        i = i+1
                        # gestion du tableau
                        t[l1]['p'] = t[l1]['p'] + int(e['scores'][0])
                        t[l1]['c'] = t[l1]['c'] + int(e['scores'][1])
                        t[l2]['p'] = t[l2]['p'] + int(e['scores'][1])
                        t[l2]['c'] = t[l2]['c'] + int(e['scores'][0])
                        if int(e['scores'][0]) > int(e['scores'][1]) :
                            t[l1]['v'] = t[l1]['v'] + 1
                            t[l2]['d'] = t[l2]['d'] + 1
                        elif int(e['scores'][0]) < int(e['scores'][1]) :
                            t[l1]['d'] = t[l1]['d'] + 1
                            t[l2]['v'] = t[l2]['v'] + 1
                        else :
                            t[l1]['n'] = t[l1]['n'] + 1
                            t[l2]['n'] = t[l2]['n'] + 1
                except :
                    if DEBUG : print e
    fo.close()
    print '\n--------------------------------------------------'
    print '{0:5} : victoire/defaite = {1:}/{2:} pour/contre = {3:}/{4:}'.format(t1,t[t1]['v'],t[t1]['d'],t[t1]['p'],t[t1]['c'])
    print '{0:5} : victoire/defaite = {1:}/{2:} pour/contre = {3:}/{4:}'.format(t2,t[t2]['v'],t[t2]['d'],t[t2]['p'],t[t2]['c'])
    return

def get_team(j):
    t = []
    t.append({})
    t.append({})
    for i in [0,1]:
        for e in j['teams'][i]['scoring']:
            #print e
            for f in j['teams'][i]['scoring'][e]:
                #print f['playerId'],time.strftime('%H:%M',time.gmtime(f['time']['secs'])),f['typeLabel']
                try :
                    joueur = str(f['playerId'])
                except :
                    joueur = 'Pen'
                try :
                    t[i][joueur].append({'type':e,'tps':time.strftime('%H:%M',time.gmtime(f['time']['secs']))})
                except :
                    t[i][joueur] = []
                    t[i][joueur].append({'type':e,'tps':time.strftime('%H:%M',time.gmtime(f['time']['secs']))})
    return t

# Recupere les information sur le match
def get_match(match):
    url = 'https://cmsapi.pulselive.com/rugby/match/'
    u = url+match+'/summary?language=en&client=pulse'
    j = get_data(u)
    print u
    team=get_team(j)
    t = time.gmtime(j['match']['time']['millis']/1000+7200)
    d= time.strftime('%A %d %B %Y', t)
    print '--------------------------------------------'
    print time.strftime('%A %d %B %Y')
    print '--------------------------------------------'
    print "({0:}) - {1:} au {2:}  -> ({3:} personnes)\n{4:}\n".format(j['match']['matchId'],j['match']['events'][0]['label'],j['match']['venue']['name'].encode('windows-1252'),j['match']['attendance'],d)
    for e in j['officials']:
        try :
            print "{0:20} {1:25}  ({2:})".format(e['position'],e['official']['name']['display'],e['official']['pob'].encode('windows-1252'))
        except:
            if DEBUG : print e
    print '\n',j['match']['teams'][0]['name'],j['match']['scores'][0],'  -  ',j['match']['scores'][1], j['match']['teams'][1]['name'],'\n'
    for i in [0,1]:
        print '--------------------------------------------'
        print '--',j['match']['teams'][i]['name'],'              ',
        try : 
            for p in team[i]['Pen'] :
                print "Essai Penalite={0:7}".format(p['tps']),
            print '\n'
        except : 
            print '\n'
        captain = j['teams'][i]['teamList']['captainId']
        for e in j['teams'][i]['teamList']['list']:
            c=''
            if captain == e['player']['id'] : c='c'
            print "{4:1} {2:3d} ({0:5}) {1:30}  '{3:12}'".format(e['player']['id'],e['player']['name']['display'].encode('windows-1252'),int(e['number']),e['positionLabel'],c),
            try : 
                for p in team[i][str(e['player']['id'])] :
                    print "{0:}={1:7}".format(p['type'],p['tps']),
                print ''
            except : 
                print '' #joueur,team[i],
        print
    print '-------------------------------------------'
    return
def get_json():
    EVENT = '1238'
    base_u = 'https://cmsapi.pulselive.com/rugby/event'
    event = str(raw_input("Choisir le numero de l'evenement ["+EVENT+"]: ")) or EVENT
    u = base_u +'/'+event+'/schedule?language=en&client=pulse'+'&status=C'
    print u
    j = get_data(u)
    # nodes : name group send receive OU
    # links : source target value
    js = {}
    name = {}
    js['nodes'] = []
    js['links'] = []
    i=0
    for e in j['matches']:
        t = time.gmtime(e['time']['millis']/1000+7200)
        d= time.strftime('%Y-%m-%d', t)
        try :
            #print "'group':'{2:2}','name':'{0:13}' {3:3} -{4:3} {1:13}{6:14} {5:}".format(e['teams'][0]['name'],e['teams'][1]['name'],e['teams'][0]['id'],e['scores'][0],e['scores'][1], time.strftime('%d/%m %H:%M', t),e['eventPhase'])
            #print "'source':{0:},'target':{1:},'value':{2:}".format(e['teams'][0]['id'],e['teams'][1]['id'],e['scores'][0]-e['scores'][1])
            js['links'].append({})
            js['links'][i]['source'] = e['teams'][0]['id']
            js['links'][i]['target'] = e['teams'][1]['id']
            js['links'][i]['value'] = e['scores'][0]+e['scores'][1]
            js['links'][i]['scoreL'] = e['scores'][0]
            js['links'][i]['scoreV'] = e['scores'][1]
            try:
                name[str(e['teams'][0]['id'])]['send'] = name[str(e['teams'][0]['id'])]['send'] + e['scores'][0]
                name[str(e['teams'][0]['id'])]['receive'] = name[str(e['teams'][0]['id'])]['receive'] + e['scores'][1]
            except:
                name[str(e['teams'][0]['id'])]={}
                name[str(e['teams'][0]['id'])]['name'] = e['teams'][0]['name']
                name[str(e['teams'][0]['id'])]['id'] = e['teams'][0]['id']
                name[str(e['teams'][0]['id'])]['send'] = 0
                name[str(e['teams'][0]['id'])]['receive'] = 0
                name[str(e['teams'][0]['id'])]['OU'] = 0 #e['eventPhase']
            try:
                name[str(e['teams'][1]['id'])]['send'] = name[str(e['teams'][1]['id'])]['send'] + e['scores'][1]
                name[str(e['teams'][1]['id'])]['receive'] = name[str(e['teams'][1]['id'])]['receive'] + e['scores'][0]
            except:
                name[str(e['teams'][1]['id'])]={}
                name[str(e['teams'][1]['id'])]['name'] = e['teams'][1]['name']
                name[str(e['teams'][1]['id'])]['id'] = e['teams'][1]['id']
                name[str(e['teams'][1]['id'])]['send'] = 0
                name[str(e['teams'][1]['id'])]['receive'] = 0
                name[str(e['teams'][1]['id'])]['OU'] = 0 #e['eventPhase']
            i = i+1
        #           json['links'].append('"source":'+e['teams'][0]['id'])
        except :
            print 'erreur'
    for e in name:
        js['nodes'].append(name[e])
    print js
    f = open(r"html/data/WRC2015.json",'w')
    json.dump(js,f)
    f.close()
    return

def get_event(startDate,endDate):
    global EVENT 
    base_u = 'https://cmsapi.pulselive.com/rugby/event'
    pageSize='100'
    page=0
    i=0
    nbPage=9
    print "Liste de evenements ... : filtre'"+args.filtre+"'"
    while page < nbPage :
        u = base_u + '?startDate='+startDate+'&endDate='+endDate+'&pageSize='+pageSize+'&page='+str(page)
        page = page+1
        j = get_data(u)
        nbPage = int(j['pageInfo']['numPages'])
        for e in j['content']:
            if (e['sport'] == args.source) & (args.filtre in e['label']) :
                print "{0:5d} - {1:60}  ({2:} / {3:})".format(int(e['id']),e['label'].encode('windows-1252'),e['start']['label'],e['end']['label'])
                EVENT = str(int(e['id']))
    event = str(raw_input("Choisir le numero de l'evenement ["+EVENT+"]: ")) or EVENT
    u = base_u +'/'+event+'/schedule?language=en&client=pulse'+'&status=C'
    j = get_data(u)
    #print j
    print '-------------------------------------------'
    print "{0:} du {1:} au {2:}\n-".format(j['event']['label'], j['event']['start']['label'], j['event']['end']['label'])
    for e in j['matches']:
        t = time.gmtime(e['time']['millis']/1000+7200)
        d= time.strftime('%Y-%m-%d', t)
        u_rk = 'https://cmsapi.pulselive.com/rugby/rankings/'+args.source+'?date='+d
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
        try :
            print "{13:5} {2:2}{0:13} {3:3} -{4:3} {1:13}{7:14} {5:} {8:5} -> ({11:4.1f}-{12:4.1f}) {6:}".format(e['teams'][0]['name'],e['teams'][1]['name'],e['status'],e['scores'][0],e['scores'][1], time.strftime('%d/%m %H:%M', t),e['venue']['name'].encode('windows-1252'),e['eventPhase'],e['attendance'],p0,p1,s0,s1,e['matchId'])
        except :
            print "{13:5} {2:2}{0:13} {3:3} -{4:3} {1:13}{7:14} {5:} {8:5} -> ({11:4.1f}-{12:4.1f}) {6:}".format(e['teams'][0]['name'],e['teams'][1]['name'],e['status'],e['scores'][0],e['scores'][1], time.strftime('%d/%m %H:%M', t),p0,e['eventPhase'],e['attendance'],p0,p1,s0,s1,e['matchId'])
    print '-------------------------------------------'
    return

    
def get_args():
    global p, args
    global DEBUG, OUTSIDE, VERBOSE, CSV
    parser = argparse.ArgumentParser()
    parser = argparse.ArgumentParser(description='Recupere les historiques de classement de l IRB depuis 2003')
    parser.add_argument("-p","--proxy",default='proxy.my-org.local:8080',help="si vous etes derriere un proxy =1")
    parser.add_argument("-s","--source",default='mru',choices=['mru','wru'],help="mru/wru pour men ou wemen")
    parser.add_argument("-m","--mode",default='maj',choices=['maj','score','all','date', 'event','match','menu'],help="maj : le classement actuel, score : evaluer un classement, all : tous les classements, date : classement à une date option -D")
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
        #       print auth.username, auth.password
        print '--------------------------------------------------------------------------'
        aff('Arguments ...','')
        aff('Men/Wemen    :',args.source)
        aff('proxy : ',proxy)
    return
""" ----------------------------------------------------------------------------------------------------------------------------"""
def rank():
    l = 'A quelle date souhaitez vous le classement : ['+args.Date+']: '
    d = str(raw_input(l)) or args.Date
    u = 'https://cmsapi.pulselive.com/rugby/rankings/'+args.source+'?date='+d
    j = get_date(u)
def event():
    startDate = str(raw_input('Date de debut [2015-01-01] :')) or '2015-01-01'
    endDate=str(raw_input('Date de fin [2015-12-31] :')) or '2015-12-31'
    get_event(startDate,endDate)
    match = str(raw_input("Choisir le numero du match [14232]: ")) or '14232'
    get_match(match)
    return  

def match():
    match = str(raw_input("Choisir le numero du match [14232]: ")) or '14232'
    get_match(match)
    return

def duel():
    team1 = str(raw_input("Abreviation de la premiere equipe [FRA]: ")) or 'FRA'
    team2 = str(raw_input("Abreviation de la premiere equipe [NZL]: ")) or 'NZL'
    startDate = str(raw_input('Date de debut [1995-01-01] :')) or '1995-01-01'
    endDate=str(raw_input('Date de fin [2015-12-31] :')) or '2015-12-31'
    get_duel(team1,team2,startDate,endDate)

"""-----------------------------------------------------------------------------------------------------------------------------"""
if __name__ == "__main__":
    oMaj,maj = '',''
    js = []
    name = {}
    get_args()
    s = requests.Session()
    t0 = time.time()
    #   u = 'http://cmsapi.pulselive.com/rugby/rankings/mru?language=en&client=pulse'
    u = 'https://cmsapi.pulselive.com/rugby/rankings/'+args.source+'?date='
    uu = 'https://cmsapi.pulselive.com/rugby/match?endDate=2015-10-13&startDate=2015-07-12&sort=desc&states=C&pageSize=10&client=pulse'
    uv = 'https://cmsapi.pulselive.com/rugby/match?startDate=2015-10-12&endDate=2019-01-12&states=U,L&pageSize=10&client=pulse'

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
        event()
    elif mode == 'match' :
        match()
    elif mode == 'menu' :
        q=False
        start=2003
        end = 2022
        while not q:
            options=menu.keys()
            options.sort()
            for entry in options:
                print entry, menu[entry]
            sel=raw_input("# selection :")
            if sel =='1':
                match()
            elif sel == '2':
                event()
            elif sel == '3':
                rank()
            elif sel == '4':
                duel()
            elif sel == '5':
                get_json()
            elif sel == '6':
                get_rank_json(u,start,end)
            elif sel == '7':
                get_rank_json_init()
            elif (sel == '8') | (sel == '0'):
                q=True
                break
            else:
                print "Mauvaise option !"
    print "\nby e-Coucou 2015, révision 2021"
"""    
        structure json :  pour une competition ... par event
            nodes : name group send receive OU // equivalence equipe id pour contre match
            links : source target value // equivalence id-1 id-2 pour-contre
        for e in j['entries']:
        print e['team']['abbreviation']
        http://cmsapi.pulselive.com/rugby/match/14232/timeline?language=en&client=pulse  timeline info
        http://cmsapi.pulselive.com/rugby/match/14232/stats?language=en&client=pulse stat info
        http://dynamic.pulselive.com/dynamic/client/irb/static/i/sprites/tLogo@x2.png // logos
        http://cmsapi.pulselive.com/rugby/team/42/   // pays id
"""
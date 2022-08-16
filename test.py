dict = {}
#
for i in [1,2,4]:
	print i
	try :
		dict['test'].append(i)
	except:
		dict['test']=[]
		dict['test'].append(i)
	print dict
print dict
for v in dict['test']:
	print v,
